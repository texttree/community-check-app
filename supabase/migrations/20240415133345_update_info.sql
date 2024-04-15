DROP FUNCTION IF EXISTS public.get_check_and_book_names(uuid);

CREATE OR REPLACE FUNCTION get_check_info(
    check_id uuid,
    user_id uuid
)
RETURNS json AS $$
DECLARE
    check_info json;
BEGIN
    SELECT json_build_object(
        'check_name', c.name,
        'book_name', b.name,
        'check_finished_at', c.finished_at,
        'is_owner', (p.user_id = get_check_info.user_id)
    )
    INTO check_info
    FROM public.checks c
    INNER JOIN public.books b ON c.book_id = b.id
    INNER JOIN public.projects p ON b.project_id = p.id
    WHERE c.id = check_id;

    RETURN check_info;
END;
$$ LANGUAGE plpgsql;
