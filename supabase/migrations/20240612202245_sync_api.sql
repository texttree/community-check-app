DROP FUNCTION IF EXISTS create_project;
DROP FUNCTION IF EXISTS get_project_by_id;
DROP FUNCTION IF EXISTS update_project_name;
DROP FUNCTION IF EXISTS create_project_book_check;
DROP FUNCTION IF EXISTS create_book;
DROP FUNCTION IF EXISTS update_book_name;
DROP FUNCTION IF EXISTS get_book_by_id;
DROP FUNCTION IF EXISTS get_notes_count_for_book;
DROP FUNCTION IF EXISTS create_check;




CREATE OR REPLACE FUNCTION public.create_project(name text, user_id uuid) 
  RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    project_exists boolean;
    result RECORD;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.projects
        WHERE projects.user_id = create_project.user_id AND projects.name = create_project.name
    ) INTO project_exists;

    IF project_exists THEN
        RAISE EXCEPTION 'A project with name % already exists for this user', name;
    ELSE
        INSERT INTO public.projects (name, user_id)
        VALUES (name, user_id)
        RETURNING public.projects.id, public.projects.name INTO result;

        RETURN row_to_json(result);
    END IF;
END;
$$;




CREATE OR REPLACE FUNCTION "public"."get_project_by_id"("project_id" bigint) RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN (
    SELECT row_to_json(row) FROM (
      SELECT id, name FROM projects WHERE id = project_id
    ) row
  );
END;
$$;


CREATE OR REPLACE FUNCTION "public"."update_project_name"(
  "project_id" bigint, 
  "new_name" text, 
  "user_id" uuid
) RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  project_exists boolean;
  user_owns_project boolean;
  result_json json;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM projects WHERE id = project_id AND projects.user_id = update_project_name.user_id
  ) INTO user_owns_project;

  IF NOT user_owns_project THEN
    RAISE EXCEPTION 'User does not own project %', project_id;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM projects WHERE name = new_name AND id != project_id
  ) INTO project_exists;

  IF NOT project_exists THEN
    UPDATE projects SET name = new_name WHERE id = project_id;
    SELECT row_to_json(r) INTO result_json FROM (SELECT id, name FROM projects WHERE id = project_id) r;
    RETURN result_json;
  ELSE
    RAISE EXCEPTION 'A project with name % already exists', new_name;
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
        -- Если проект не существует, создаем его и получаем его id из результата
        SELECT (create_project(project_name, user_id)->>'id')::bigint INTO project_id_table;
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
        -- Если книга не существует, создаем ее и получаем ее id из результата
        SELECT (create_book(project_id_table, book_name, user_id)->>'id')::bigint INTO book_id;
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


CREATE OR REPLACE FUNCTION public.create_book(
    project_id BIGINT,
    book_name TEXT,
    user_id UUID
) 
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    book_id BIGINT;
    book_exists BOOLEAN;
    result JSONB;
    created_at TIMESTAMP;
BEGIN
    -- Проверка прав доступа пользователя к проекту
    IF NOT is_user_valid_for_project(project_id, user_id) THEN
        RAISE EXCEPTION 'Permission denied. User does not have access to the project';
    END IF;

    -- Проверка на существование книги с таким именем в проекте
    SELECT EXISTS (
        SELECT 1
        FROM public.books b
        WHERE b.project_id = create_book.project_id
          AND b.name = book_name
    ) INTO book_exists;

    IF book_exists THEN
        RAISE EXCEPTION 'A book with the name % already exists for this project', book_name;
    ELSE
        -- Вставка новой книги и получение id, name и created_at
        INSERT INTO public.books (name, project_id)
        VALUES (book_name, project_id)
        RETURNING id, name, current_timestamp INTO book_id, book_name, created_at;

        -- Формирование результата в формате JSONB
        result := jsonb_build_object(
            'id', book_id,
            'name', book_name,
            'created_at', created_at
        );

        RETURN result;
    END IF;
END;
$$;



CREATE OR REPLACE FUNCTION "public"."update_book_name"("book_id" bigint, "new_name" "text") RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    project_id_val bigint;
BEGIN
    SELECT project_id INTO project_id_val FROM public.books WHERE id = book_id;

    IF EXISTS(
        SELECT 1
        FROM public.books
        WHERE project_id = project_id_val
        AND name = new_name
    ) THEN
        RAISE EXCEPTION 'A book named % already exists for this project', new_name;
    ELSE
        UPDATE public.books SET name = new_name WHERE id = book_id;
        RETURN (SELECT row_to_json(r) FROM (SELECT id, name, created_at FROM public.books WHERE id = book_id) r);
    END IF;
END;
$$;


CREATE OR REPLACE FUNCTION public.get_book_by_id(
    book_id BIGINT,
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
    IF is_user_valid_for_book(book_id, user_id) THEN
        RETURN QUERY
        SELECT
            b.id,
            b.name,
            b.created_at
        FROM
            public.books b
        WHERE
            b.id = book_id;
    ELSE
        RAISE EXCEPTION 'Permission denied. User does not have access to this book';
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
            'check_name', subquery.name,
            'notes_count', subquery.notes_count
        ))
        INTO result
        FROM (
            SELECT c.id, c.name, COUNT(n.id) AS notes_count
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

CREATE OR REPLACE FUNCTION public.create_check(
    check_name TEXT, 
    check_material_link TEXT, 
    check_started_at TIMESTAMPTZ, 
    check_finished_at TIMESTAMPTZ, 
    book_id BIGINT, 
    user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
    user_exists BOOLEAN;
    result RECORD;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.books AS b
        JOIN public.projects AS p ON b.project_id = p.id
        JOIN public.users AS u ON p.user_id = u.id
        WHERE b.id = create_check.book_id AND u.id = create_check.user_id AND u.is_blocked = false
    )
    INTO user_exists;

    IF user_exists THEN
        INSERT INTO public.checks (name, material_link, started_at, finished_at, book_id)
        VALUES (check_name, check_material_link, check_started_at, check_finished_at, book_id)
        RETURNING checks.id, checks.name, checks.material_link, current_timestamp AS created_at, check_started_at AS started_at, check_finished_at AS finished_at
        INTO result;

        RETURN jsonb_build_object(
            'id', result.id,
            'name', result.name,
            'material_link', result.material_link,
            'created_at', result.created_at,
            'started_at', result.started_at,
            'finished_at', result.finished_at
        );
    ELSE
        RAISE EXCEPTION 'User not found';
    END IF;
END;
$function$;

