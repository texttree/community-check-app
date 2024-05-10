DROP FUNCTION IF EXISTS soft_delete_check(p_check_id uuid, p_user_id uuid);
DROP FUNCTION IF EXISTS soft_delete_check(check_id uuid, user_id uuid);

DROP FUNCTION IF EXISTS delete_project;

CREATE OR REPLACE FUNCTION soft_delete_check(check_id uuid, user_id uuid)
    RETURNS void
    LANGUAGE plpgsql
AS $$
DECLARE
    check_owner boolean;
BEGIN
    SELECT (p.user_id = soft_delete_check.user_id)
    INTO check_owner
    FROM public.checks as c
    INNER JOIN public.books as b ON c.book_id = b.id
    INNER JOIN public.projects as p ON b.project_id = p.id
    WHERE c.id = soft_delete_check.check_id and c.deleted_at is NULL;

    IF NOT check_owner THEN
        RAISE EXCEPTION 'Permission denied. You are not the owner of this check.';
    END IF;

    UPDATE public.checks
    SET deleted_at = NOW()
    WHERE id = soft_delete_check.check_id;

    UPDATE public.notes
    SET deleted_at = NOW()
    WHERE notes.check_id = soft_delete_check.check_id;

    UPDATE public.inspectors
    SET deleted_at = NOW()
    WHERE inspectors.check_id = soft_delete_check.check_id;

END;
$$;

DROP FUNCTION IF EXISTS delete_book(user_id uuid, book_id bigint);

DROP FUNCTION IF EXISTS delete_book(p_user_id uuid, p_book_id bigint);

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
        WHERE books.id = delete_book.book_id;
    ELSE
        RAISE EXCEPTION 'Permission denied. You are not the owner of this book.';
    END IF;
END;
$$ LANGUAGE plpgsql;


ALTER TABLE ONLY "public"."books"
    DROP CONSTRAINT IF EXISTS "books_project_id_fkey";

ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;


ALTER TABLE ONLY "public"."checks"
    DROP CONSTRAINT IF EXISTS "checks_book_id_fkey";

ALTER TABLE ONLY "public"."checks"
    ADD CONSTRAINT "checks_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."inspectors"
    DROP CONSTRAINT IF EXISTS "inspectors_check_id_fkey";

ALTER TABLE ONLY "public"."inspectors"
    ADD CONSTRAINT "inspectors_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "public"."checks"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notes"
    DROP CONSTRAINT IF EXISTS "notes_inspector_id_fkey";

ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "public"."inspectors"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notes"
    DROP CONSTRAINT IF EXISTS "notes_material_id_fkey";

ALTER TABLE ONLY "public"."notes"
    DROP CONSTRAINT IF EXISTS "notes_check_id_fkey";

ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "public"."checks"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."projects"
    DROP CONSTRAINT IF EXISTS "projects_user_id_fkey";

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."tokens"
    DROP CONSTRAINT IF EXISTS "tokens_user_id_fkey";

ALTER TABLE ONLY "public"."tokens"
    ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."users"
    DROP CONSTRAINT IF EXISTS "users_id_fkey";

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

