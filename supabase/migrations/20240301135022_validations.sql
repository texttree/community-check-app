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
