DROP FUNCTION IF EXISTS create_project;
DROP FUNCTION IF EXISTS get_project_by_id;
DROP FUNCTION IF EXISTS update_project_name;

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
