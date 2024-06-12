DROP FUNCTION IF EXISTS create_project;

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


