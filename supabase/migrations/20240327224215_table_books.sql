ALTER TABLE public.books
ADD COLUMN created_at timestamp with time zone not null default now();


DROP FUNCTION IF EXISTS  public.get_books_by_project;

CREATE OR REPLACE FUNCTION get_books_by_project(p_project_id bigint)
RETURNS TABLE (
    book_id bigint,
    book_name text,
    book_created_at timestamp with time zone, 
    book_deleted_at timestamp with time zone
)
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
        project_id = p_project_id;
END;
$$ LANGUAGE plpgsql;
