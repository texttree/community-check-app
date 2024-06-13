DROP FUNCTION IF EXISTS create_project;
DROP FUNCTION IF EXISTS get_project_by_id;
DROP FUNCTION IF EXISTS update_project_name;
DROP FUNCTION IF EXISTS create_project_book_check;

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
        SELECT (create_book(project_id_table, book_name, user_id)->>'book_id')::bigint INTO book_id;
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
