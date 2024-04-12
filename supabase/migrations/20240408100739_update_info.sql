CREATE OR REPLACE FUNCTION get_check_and_book_names(checks_id uuid)
RETURNS json AS
$$
DECLARE
    check_info json;
BEGIN
    SELECT json_build_object(
        'check_name', c.name,
        'book_name', b.name
    )
    INTO check_info
    FROM public.checks c
    INNER JOIN public.books b ON c.book_id = b.id
    WHERE c.id = checks_id;

    RETURN check_info;
END;
$$
LANGUAGE plpgsql;
