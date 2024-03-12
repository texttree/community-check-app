DROP FUNCTION IF EXISTS  public.create_project;
DROP FUNCTION IF EXISTS  public.check_existing_project;

DROP FUNCTION IF EXISTS  public.check_existing_book;
DROP FUNCTION IF EXISTS  public.create_book;


CREATE OR REPLACE FUNCTION public.create_project(
    p_name text
)
RETURNS bigint AS $$
DECLARE
    project_id bigint;
    project_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.projects
        WHERE user_id = auth.uid() AND name = p_name AND deleted_at IS NULL
    ) INTO project_exists;

    IF project_exists THEN
        RETURN -1; 
    END IF;

    INSERT INTO public.projects (name, user_id)
    VALUES (p_name, auth.uid())
    RETURNING id INTO project_id;

    RETURN project_id;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION create_book(p_project_id BIGINT, book_name TEXT)
RETURNS JSONB AS $$
DECLARE
    book_id BIGINT;
    book_exists BOOLEAN;
    result JSONB;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.books AS b
        WHERE b.project_id = p_project_id AND b.name = book_name AND b.deleted_at IS NULL
    ) INTO book_exists;

    IF book_exists THEN
        result := jsonb_build_object('book_id', -1);
        RETURN result;
    END IF;

    INSERT INTO public.books (name, project_id)
    VALUES (book_name, p_project_id)
    RETURNING id INTO book_id;

    result := jsonb_build_object('book_id', book_id);

    RETURN result;
END;
$$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION get_project_by_id(project_id bigint)
RETURNS json
AS $$
BEGIN
  RETURN (
    SELECT row_to_json(projects) FROM projects WHERE id = project_id
  );
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_project_name(project_id bigint, new_name text)
RETURNS json
AS $$
DECLARE
  project_exists boolean;
  result_json json;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM projects WHERE name = new_name AND id != project_id
  ) INTO project_exists;

  IF NOT project_exists THEN
    UPDATE projects SET name = new_name WHERE id = project_id;
    SELECT row_to_json(r) INTO result_json FROM (SELECT * FROM projects WHERE id = project_id) r;
    RETURN result_json;
  ELSE
    RETURN '{"result":null}'::json;
  END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_books_by_project(p_project_id bigint)
RETURNS TABLE (
    book_id bigint,
    book_name text,
    book_deleted_at timestamp with time zone
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        id as book_id,
        name as book_name,
        deleted_at
    FROM
        public.books
    WHERE
        project_id = p_project_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_book_by_id(book_id bigint)
RETURNS TABLE (
    book_name text,
    book_project_id bigint,
    book_deleted_at timestamp with time zone
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        name as book_name,
        project_id,
        deleted_at
    FROM
        public.books
    WHERE
        id = get_book_by_id.book_id;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION update_book_name(book_id bigint, new_name text)
RETURNS json
AS $$
DECLARE
    project_id_val bigint;
    book_exists boolean;
    result_json json;
BEGIN
    SELECT project_id INTO project_id_val FROM public.books WHERE id = book_id;

    SELECT EXISTS(
        SELECT 1
        FROM public.books
        WHERE project_id = project_id_val
        AND name = new_name
    ) INTO book_exists;

    IF NOT book_exists THEN
        UPDATE public.books SET name = new_name WHERE id = book_id;
        SELECT row_to_json(r) INTO result_json FROM (SELECT * FROM public.books WHERE id = book_id) r;
        RETURN result_json;
    ELSE
        RETURN '{"result":null}'::json;
    END IF;
END;
$$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION get_checks_for_book(book_id_param bigint)
RETURNS TABLE (
    check_id uuid,
    check_name text,
    check_material_link text,
    check_start_time timestamp with time zone,
    check_finish_time timestamp with time zone
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        id AS check_id,
        name AS check_name,
        material_link,
        started_at AS start_time,
        finished_at AS finish_time
    FROM
        public.checks
    WHERE
        book_id = book_id_param
        AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;
