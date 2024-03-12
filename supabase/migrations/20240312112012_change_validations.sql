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
