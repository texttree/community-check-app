drop FUNCTION IF EXISTS  public.update_book_name;

CREATE OR REPLACE FUNCTION update_book_name(book_id bigint, new_name text)
RETURNS json
AS $$
DECLARE
    project_id_val bigint;
BEGIN
    SELECT project_id INTO project_id_val FROM public.books WHERE id = book_id;

    IF EXISTS(
        SELECT 1
        FROM public.books
        WHERE project_id = project_id_val
        AND name = new_name
    ) THEN
        RAISE EXCEPTION 'A book named % already exists for this project', new_name;
    ELSE
        UPDATE public.books SET name = new_name WHERE id = book_id;
        RETURN (SELECT row_to_json(r) FROM (SELECT * FROM public.books WHERE id = book_id) r);
    END IF;
END;
$$ LANGUAGE plpgsql;
