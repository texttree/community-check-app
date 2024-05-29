CREATE OR REPLACE FUNCTION "public"."get_check_info"("check_id" "uuid", "user_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    check_info json;
BEGIN
    SELECT json_build_object(
        'check_name', c.name,
        'material_link', c.material_link,
        'book_name', b.name,
        'check_finished_at', c.finished_at,
        'deleted_at', c.deleted_at,
        'is_owner', (p.user_id = get_check_info.user_id)
    )
    INTO check_info
    FROM public.checks c
    INNER JOIN public.books b ON c.book_id = b.id
    INNER JOIN public.projects p ON b.project_id = p.id
    WHERE c.id = check_id;

    RETURN check_info;
END;
$$;
