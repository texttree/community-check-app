DROP FUNCTION IF EXISTS soft_delete_check(p_check_id uuid, p_user_id uuid);
DROP FUNCTION IF EXISTS soft_delete_check(check_id uuid, user_id uuid);

DROP FUNCTION IF EXISTS delete_project;
DROP FUNCTION IF EXISTS find_token;
DROP FUNCTION IF EXISTS get_user_project_info;
DROP FUNCTION IF EXISTS has_notes;
DROP FUNCTION IF EXISTS create_book;
DROP FUNCTION IF EXISTS get_book_by_id;

DROP FUNCTION IF EXISTS get_checks_for_book;
DROP FUNCTION IF EXISTS get_notes_count_for_book;
DROP FUNCTION IF EXISTS get_notes_by_check_id;


CREATE OR REPLACE FUNCTION soft_delete_check(check_id uuid, user_id uuid)
    RETURNS void
    LANGUAGE plpgsql
AS $$
DECLARE
    check_owner boolean;
BEGIN
    SELECT (p.user_id = soft_delete_check.user_id)
    INTO check_owner
    FROM public.checks as c
    INNER JOIN public.books as b ON c.book_id = b.id
    INNER JOIN public.projects as p ON b.project_id = p.id
    WHERE c.id = soft_delete_check.check_id and c.deleted_at is NULL;

    IF NOT check_owner THEN
        RAISE EXCEPTION 'Permission denied. You are not the owner of this check.';
    END IF;

    UPDATE public.checks
    SET deleted_at = NOW()
    WHERE id = soft_delete_check.check_id;

    UPDATE public.notes
    SET deleted_at = NOW()
    WHERE notes.check_id = soft_delete_check.check_id;

    UPDATE public.inspectors
    SET deleted_at = NOW()
    WHERE inspectors.check_id = soft_delete_check.check_id;

END;
$$;

DROP FUNCTION IF EXISTS delete_book(user_id uuid, book_id bigint);

DROP FUNCTION IF EXISTS delete_book(p_user_id uuid, p_book_id bigint);

ALTER TABLE ONLY "public"."books"
    DROP CONSTRAINT IF EXISTS "books_project_id_fkey";

ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;


ALTER TABLE ONLY "public"."checks"
    DROP CONSTRAINT IF EXISTS "checks_book_id_fkey";

ALTER TABLE ONLY "public"."checks"
    ADD CONSTRAINT "checks_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."inspectors"
    DROP CONSTRAINT IF EXISTS "inspectors_check_id_fkey";

ALTER TABLE ONLY "public"."inspectors"
    ADD CONSTRAINT "inspectors_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "public"."checks"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notes"
    DROP CONSTRAINT IF EXISTS "notes_inspector_id_fkey";

ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "public"."inspectors"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notes"
    DROP CONSTRAINT IF EXISTS "notes_material_id_fkey";

ALTER TABLE ONLY "public"."notes"
    DROP CONSTRAINT IF EXISTS "notes_check_id_fkey";

ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "public"."checks"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."projects"
    DROP CONSTRAINT IF EXISTS "projects_user_id_fkey";

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."tokens"
    DROP CONSTRAINT IF EXISTS "tokens_user_id_fkey";

ALTER TABLE ONLY "public"."tokens"
    ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."users"
    DROP CONSTRAINT IF EXISTS "users_id_fkey";

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION has_notes(inspector_id uuid)
  RETURNS BOOLEAN
  AS $$
  DECLARE
    note_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO note_count
    FROM public.notes
    WHERE notes.inspector_id = has_notes.inspector_id;

    RETURN note_count > 0;
  END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_user_valid_for_check(
    check_id UUID,
    user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.checks c
        JOIN public.books b ON c.book_id = b.id
        JOIN public.projects p ON b.project_id = p.id
        JOIN public.users u ON p.user_id = u.id
        WHERE c.id = is_user_valid_for_check.check_id
          AND u.id = is_user_valid_for_check.user_id
          AND c.deleted_at IS NULL
          AND u.is_blocked = FALSE
    );
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION public.is_user_valid_for_book(
    book_id BIGINT,
    user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.books b
        JOIN public.projects p ON b.project_id = p.id
        WHERE b.id = is_user_valid_for_book.book_id
          AND p.user_id = is_user_valid_for_book.user_id
    );
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION delete_book(user_id UUID, book_id BIGINT) RETURNS VOID AS $$
BEGIN
    IF is_user_valid_for_book(book_id, user_id) THEN
        DELETE FROM public.books
        WHERE books.id = delete_book.book_id;
    ELSE
        RAISE EXCEPTION 'Permission denied. You are not the owner of this book.';
    END IF;
END;
$$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION public.get_checks_for_book(
    book_id BIGINT,
    user_id UUID
)
RETURNS TABLE(
    id UUID,
    name TEXT,
    material_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF is_user_valid_for_book(book_id, user_id) THEN
        RETURN QUERY
        SELECT
            c.id,
            c.name,
            c.material_link,
            c.created_at,
            c.started_at,
            c.finished_at
        FROM
            public.checks c
        WHERE
            c.book_id = get_checks_for_book.book_id
          AND c.deleted_at IS NULL;
    ELSE
        RAISE EXCEPTION 'User not found or permission denied';
    END IF;
END;
$$;



CREATE OR REPLACE FUNCTION public.get_notes_count_for_book(
    book_id BIGINT,
    user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
BEGIN
    IF is_user_valid_for_book(book_id, user_id) THEN
        SELECT json_agg(json_build_object(
            'check_id', subquery.id,
            'notes_count', subquery.notes_count
        ))
        INTO result
        FROM (
            SELECT c.id, COUNT(n.id) AS notes_count
            FROM public.checks c
            LEFT JOIN public.notes n ON c.id = n.check_id
            WHERE c.book_id = get_notes_count_for_book.book_id
              AND c.deleted_at IS NULL
              AND n.deleted_at IS NULL
            GROUP BY c.id
        ) AS subquery;

        RETURN result;
    ELSE
        RAISE EXCEPTION 'User not found or permission denied';
    END IF;
END;
$$;


CREATE OR REPLACE FUNCTION public.get_notes_by_check_id(
    check_id UUID,
    user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    notes_data JSON;
BEGIN
    IF is_user_valid_for_check(check_id, user_id) THEN
        SELECT json_agg(
            json_build_object(
                'chapter', n.chapter,
                'verse', n.verse,
                'note', n.note,
                'inspector_name', i.name
            )
        )
        INTO notes_data
        FROM public.notes n
        LEFT JOIN public.inspectors i ON n.inspector_id = i.id
        WHERE n.check_id = get_notes_by_check_id.check_id
          AND n.deleted_at IS NULL;

        RETURN notes_data;
    ELSE
        RAISE EXCEPTION 'Permission denied. You do not have access to this check.';
    END IF;
END;
$$;


CREATE OR REPLACE FUNCTION public.is_user_valid_for_project(
    project_id BIGINT,
    user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.projects p
        WHERE p.id = is_user_valid_for_project.project_id
          AND p.user_id = is_user_valid_for_project.user_id
    );
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION public.create_book(
    project_id BIGINT,
    name TEXT,
    user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    book_id BIGINT;
    book_exists BOOLEAN;
    result JSONB;
BEGIN
    IF NOT is_user_valid_for_project(project_id, user_id) THEN
        RAISE EXCEPTION 'Permission denied. User does not have access to the project';
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM public.books b
        WHERE b.project_id = create_book.project_id
          AND b.name = create_book.name
    ) INTO book_exists;

    IF book_exists THEN
        RAISE EXCEPTION 'A book with the name % already exists for this project', name;
    ELSE
        INSERT INTO public.books (name, project_id)
        VALUES (name, project_id)
        RETURNING id INTO book_id;

        result := jsonb_build_object('book_id', book_id);

        RETURN result;
    END IF;
END;
$$;


CREATE OR REPLACE FUNCTION public.get_book_by_id(
    book_id BIGINT,
    user_id UUID
)
RETURNS TABLE(
    name TEXT,
    project_id BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF is_user_valid_for_book(book_id, user_id) THEN
        RETURN QUERY
        SELECT
            b.name,
            b.project_id
        FROM
            public.books b
        WHERE
            b.id = book_id;
    ELSE
        RAISE EXCEPTION 'Permission denied. User does not have access to this book';
    END IF;
END;
$$;



CREATE OR REPLACE FUNCTION public.get_books_by_project(
    project_id BIGINT,
    user_id UUID
)
RETURNS TABLE(
    id BIGINT,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF is_user_valid_for_project(project_id, user_id) THEN
        RETURN QUERY
        SELECT
            b.id,
            b.name,
            b.created_at
        FROM
            public.books b
        WHERE
            b.project_id = get_books_by_project.project_id;
    ELSE
        RAISE EXCEPTION 'Permission denied. User does not have access to this project';
    END IF;
END;
$$;


CREATE OR REPLACE FUNCTION public.create_project_book_check(
    user_id uuid,
    project_name text,
    book_name text,
    check_name text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    project_id_table bigint;
    book_id bigint;
    check_id uuid;
    project_exists boolean;
    book_exists boolean;
    result jsonb;
BEGIN

    -- Проверяем существует ли проект
    SELECT EXISTS (
        SELECT 1
        FROM public.projects p
        WHERE p.name = project_name AND p.user_id = create_project_book_check.user_id
    ) INTO project_exists;

    IF project_exists THEN
        -- Если проект существует, получаем его id
        SELECT p.id INTO project_id_table
        FROM public.projects p
        WHERE p.name = project_name AND p.user_id = create_project_book_check.user_id;
    ELSE
        -- Если проект не существует, создаем его
        project_id_table := create_project(project_name, user_id);
    END IF;

    -- Проверяем существует ли книга
    SELECT EXISTS (
        SELECT 1
        FROM public.books b
        WHERE b.name = book_name AND b.project_id = project_id_table
    ) INTO book_exists;

    IF book_exists THEN
        -- Если книга существует, получаем ее id
        SELECT b.id INTO book_id
        FROM public.books b
        WHERE b.name = book_name AND b.project_id = project_id_table;
    ELSE
        -- Если книга не существует, создаем ее
        result := create_book(project_id_table, book_name, user_id);
        book_id := (result->>'book_id')::bigint;
    END IF;

    -- Создаем проверку
    check_id := create_fast_check(check_name, book_id, user_id);

    -- Возвращаем результат
    result := jsonb_build_object(
        'project_id', project_id_table,
        'book_id', book_id,
        'check_id', check_id
    );

    RETURN result;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating project, book, or check: %', SQLERRM;
END;
$$;


