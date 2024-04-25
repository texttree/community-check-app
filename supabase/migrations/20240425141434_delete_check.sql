DROP FUNCTION IF EXISTS soft_delete_check;

CREATE OR REPLACE FUNCTION soft_delete_check(p_check_id uuid, p_user_id uuid)
    RETURNS void
    LANGUAGE plpgsql
AS $$
DECLARE
    check_owner boolean;
BEGIN
    SELECT (p.user_id = p_user_id)
    INTO check_owner
    FROM public.checks c
    INNER JOIN public.books b ON c.book_id = b.id
    INNER JOIN public.projects p ON b.project_id = p.id
    WHERE c.id = p_check_id;

    IF NOT check_owner THEN
        RAISE EXCEPTION 'Permission denied. You are not the owner of this check.';
    END IF;

    UPDATE public.checks
    SET deleted_at = NOW()
    WHERE id = p_check_id;

    UPDATE public.materials
    SET deleted_at = NOW()
    WHERE check_id = p_check_id;

    UPDATE public.notes
    SET deleted_at = NOW()
    WHERE material_id IN (SELECT id FROM public.materials WHERE check_id = p_check_id);

    UPDATE public.inspectors
    SET deleted_at = NOW()
    WHERE check_id = p_check_id;

END;
$$;
