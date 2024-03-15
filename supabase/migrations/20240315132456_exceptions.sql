DROP FUNCTION IF EXISTS  public.create_project;

DROP FUNCTION IF EXISTS  public.update_project_name;

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
        RAISE EXCEPTION 'A project with name % already exists for this user', p_name;
    ELSE
        INSERT INTO public.projects (name, user_id)
        VALUES (p_name, auth.uid())
        RETURNING id INTO project_id;

        RETURN project_id;
    END IF;
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
    RAISE EXCEPTION 'A project with name % already exists', new_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

