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


DROP FUNCTION IF EXISTS create_check;
CREATE OR REPLACE FUNCTION public.create_check(name text, material_link text, started_at timestamptz, finished_at timestamptz,
book_id bigint, user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    check_id uuid;
    user_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.books AS b
        JOIN public.projects AS p ON b.project_id = p.id
        JOIN public.users AS u ON p.user_id = u.id
        WHERE b.id = create_check.book_id AND u.id = create_check.user_id AND u.is_blocked = false
    )
    INTO user_exists;

    IF user_exists THEN
        INSERT INTO public.checks (name, material_link, started_at, finished_at, book_id)
        VALUES (name, material_link, started_at, finished_at, book_id)
        RETURNING id INTO check_id;
        RETURN check_id;
    ELSE
        RAISE EXCEPTION 'User not found';
    END IF;
END;
$function$;

