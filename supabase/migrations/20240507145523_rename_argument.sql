DROP FUNCTION IF EXISTS soft_delete_check;

CREATE OR REPLACE FUNCTION soft_delete_check(check_id uuid, user_id uuid)
    RETURNS void
    LANGUAGE plpgsql
AS $$
DECLARE
    check_owner boolean;
BEGIN
    SELECT (p.user_id = soft_delete_check.user_id)
    INTO check_owner
    FROM public.checks c
    INNER JOIN public.books b ON c.book_id = b.id
    INNER JOIN public.projects p ON b.project_id = p.id
    WHERE c.id = soft_delete_check.check_id;

    IF NOT check_owner THEN
        RAISE EXCEPTION 'Permission denied. You are not the owner of this check.';
    END IF;

    UPDATE public.checks
    SET deleted_at = NOW()
    WHERE id = soft_delete_check.check_id;

    UPDATE public.materials
    SET deleted_at = NOW()
    WHERE materials.check_id = soft_delete_check.check_id;

    UPDATE public.notes
    SET deleted_at = NOW()
    WHERE material_id IN (SELECT id FROM public.materials WHERE materials.check_id = soft_delete_check.check_id);

    UPDATE public.inspectors
    SET deleted_at = NOW()
    WHERE inspectors.check_id = soft_delete_check.check_id;

END;
$$;

DROP FUNCTION IF EXISTS delete_book;

CREATE OR REPLACE FUNCTION delete_book(user_id uuid, book_id bigint) RETURNS void AS $$
DECLARE
    user_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM public.books b
        JOIN public.projects p ON b.project_id = p.id
        WHERE b.id = delete_book.book_id AND p.user_id = delete_book.user_id 
    ) INTO user_exists;

    IF user_exists THEN
        DELETE FROM public.books
        WHERE id = delete_book.book_id;
    ELSE
        RAISE EXCEPTION 'Permission denied. You are not the owner of this book.';
    END IF;
END;
$$ LANGUAGE plpgsql;


DROP FUNCTION IF EXISTS delete_project;
