CREATE OR REPLACE  FUNCTION is_deleted_null(p_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
    deleted_time timestamp with time zone;
BEGIN
    SELECT deleted_at INTO deleted_time
    FROM public.inspectors
    WHERE id = p_id;
    
    RETURN deleted_time IS NULL;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION has_notes(p_inspector_id uuid) 
  RETURNS BOOLEAN 
  AS $$ 
  DECLARE 
    note_count INTEGER;
  BEGIN 
    SELECT COUNT(*) INTO note_count 
    FROM public.notes 
    WHERE inspector_id = p_inspector_id;
    
    RETURN note_count > 0;
  END;
$$
LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS public.delete_inspector_and_notes;

CREATE OR REPLACE FUNCTION delete_inspector_and_notes(p_user_id uuid, p_inspector_id uuid, p_delete_notes boolean)
RETURNS void AS
$$
BEGIN
    IF check_inspector_user_relation(p_user_id, p_inspector_id) THEN
        IF p_delete_notes THEN
            UPDATE public.notes
            SET deleted_at = now()
            WHERE inspector_id = p_inspector_id;
        END IF;
    
        UPDATE public.inspectors
        SET deleted_at = now()
        WHERE id = p_inspector_id;
    ELSE
        RAISE EXCEPTION 'Inspector is not related to the user';
    END IF;
END;
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION check_inspector_user_relation(p_user_id uuid, p_inspector_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
    v_project_id bigint;
BEGIN
    SELECT id INTO v_project_id
    FROM public.projects
    WHERE user_id = p_user_id;

    RETURN EXISTS (
        SELECT 1
        FROM public.projects pr
        JOIN public.books b ON pr.id = b.project_id
        JOIN public.checks c ON b.id = c.book_id
        JOIN public.inspectors i ON c.id = i.check_id
        WHERE pr.id = v_project_id
        AND i.id = p_inspector_id
     
    );
END;
$$ LANGUAGE plpgsql;


