CREATE OR REPLACE FUNCTION get_check_and_book_names(checks_id uuid)
RETURNS TABLE(check_name text, book_name text) AS
$$
BEGIN
    RETURN QUERY
    SELECT c.name AS check_name, b.name AS book_name
    FROM public.checks c
    INNER JOIN public.books b ON c.book_id = b.id
    WHERE c.id = checks_id;
END;
$$
LANGUAGE plpgsql;
