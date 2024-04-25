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


CREATE OR REPLACE FUNCTION soft_delete_book(p_book_id bigint, p_user_id uuid)
RETURNS void AS
$$
DECLARE
    check_id uuid;
BEGIN
    UPDATE public.books
    SET deleted_at = NOW()
    WHERE id = p_book_id;

    FOR check_id IN SELECT id FROM public.checks WHERE book_id = p_book_id LOOP
        PERFORM soft_delete_check(check_id, p_user_id);
    END LOOP;

END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION "public"."get_books_by_project"("p_project_id" bigint) 
RETURNS TABLE("book_id" bigint, "book_name" "text", "book_created_at" timestamp with time zone, "book_deleted_at" timestamp with time zone)
LANGUAGE "plpgsql"
AS $$
BEGIN
    RETURN QUERY
    SELECT
        id as book_id,
        name as book_name,
        created_at as book_created_at, 
        deleted_at as book_deleted_at
    FROM
        public.books
    WHERE
        project_id = p_project_id
        AND deleted_at IS NULL;
END;
$$;
