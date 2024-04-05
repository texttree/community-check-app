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



CREATE OR REPLACE FUNCTION get_notes_count_for_book(book_id bigint)
RETURNS json AS
$$
DECLARE
    result json;
BEGIN
    SELECT json_agg(json_build_object(
        'check_id', subquery.id,
        'notes_count', subquery.notes_count
    ))
    INTO result
    FROM (
        SELECT c.id, COUNT(n.id) AS notes_count
        FROM checks c
        LEFT JOIN materials m ON c.id = m.check_id
        LEFT JOIN notes n ON m.id = n.material_id
        WHERE c.book_id = get_notes_count_for_book.book_id
        GROUP BY c.id
    ) AS subquery;

    RETURN result;
END;
$$
LANGUAGE plpgsql;
