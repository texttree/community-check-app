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


ALTER TABLE public.checks
RENAME COLUMN started_at TO created_at;

ALTER TABLE public.checks
ADD COLUMN started_at timestamp with time zone null;



DROP FUNCTION IF EXISTS  public.get_checks_for_book;

CREATE OR REPLACE FUNCTION get_checks_for_book(book_id_param bigint)
RETURNS TABLE (
    check_id uuid,
    check_name text,
    check_material_link text,
    check_created_time timestamp with time zone,
    check_started_time timestamp with time zone,
    check_finished_time timestamp with time zone
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        id AS check_id,
        name AS check_name,
        material_link AS check_material_link,
        created_at AS check_created_time,
        started_at AS check_started_time,
        finished_at AS check_finished_time
    FROM
        public.checks
    WHERE
        book_id = book_id_param
        AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;
