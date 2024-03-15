DROP FUNCTION IF EXISTS  public.create_project;

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
