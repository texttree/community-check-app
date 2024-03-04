CREATE OR REPLACE FUNCTION check_existing_project(user_id UUID, project_name TEXT)
RETURNS BOOLEAN AS $$
  DECLARE
    project_exists BOOLEAN;
  BEGIN
    SELECT EXISTS (
      SELECT 1
      FROM projects p
      WHERE p.user_id = $1 AND p.name = $2 AND p.deleted_at IS NULL
    ) INTO project_exists;

    RETURN project_exists;
  END;
$$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION create_project(user_id UUID, project_name TEXT)
RETURNS JSONB AS $$
  DECLARE
    project_id BIGINT;
    result JSONB;
  BEGIN
    INSERT INTO projects (user_id, name)
    VALUES (user_id, project_name)
    RETURNING id INTO project_id;

    result := jsonb_build_object('id', project_id);

    RETURN result;
  END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION check_existing_book(project_id BIGINT, book_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    book_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
      SELECT 1
      FROM public.books AS b
      WHERE b.project_id = $1 AND b.name = $2 AND b.deleted_at IS NULL
    ) INTO book_exists;

    RETURN book_exists;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION create_book(project_id BIGINT, book_name TEXT)
RETURNS JSONB AS $$
DECLARE
    book_id BIGINT;
    result JSONB;
BEGIN
    INSERT INTO public.books (name, project_id)
    VALUES (book_name, project_id)
    RETURNING id INTO book_id;

    result := jsonb_build_object('book_id', book_id);

    RETURN result;
END;
$$ LANGUAGE plpgsql;
