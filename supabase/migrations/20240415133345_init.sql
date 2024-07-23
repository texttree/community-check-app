SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE OR REPLACE FUNCTION "public"."admin_only"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  declare
    access int;
  begin
    select
      count(id) into access
    from
      public.users
    where
      users.id = auth.uid() and users.is_admin and users.is_blocked is not true;
    return access > 0;
  end;
$$;

ALTER FUNCTION "public"."admin_only"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."admin_or_user"("check_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  declare
    access int;
  begin
    select
      count(c.id) into access
    from
      public.checks as c
      inner join public.books as b on (b.id = c.book_id)
      inner join public.projects as p on (p.id = b.project_id)
      inner join public.users as u on (u.id = p.user_id)
    where
      c.id = admin_or_user.check_id
      and c.deleted_at is null
      and b.deleted_at is null
      and p.deleted_at is null
      and u.id = auth.uid()
      and u.is_blocked is not true;
    return access > 0;
  end;
$$;

ALTER FUNCTION "public"."admin_or_user"("check_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."authorized"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  declare
    access int;
  begin
    select
      count(id) into access
    from
      public.users
    where
      users.id = auth.uid()  and users.is_blocked is not true;
    return access > 0;
  end;
$$;

ALTER FUNCTION "public"."authorized"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_user_books"("project_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  declare
    access int;
  begin
    if admin_only() then
      return true;
    end if;

    select count(p.id) into access
    from public.projects as p
      left join public.users as u on (u.id = p.user_id)
    where p.id = check_user_books.project_id
      and u.id = auth.uid()
      and u.is_blocked is not true;
    return access > 0;
  end;
$$;

ALTER FUNCTION "public"."check_user_books"("project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_user_checks"("book_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
  declare
    access int;
  begin
    if admin_only() then
      return true;
    end if;

    select count(p.id) into access
    from public.books as b
      left join public.projects as p on (p.id = b.project_id)
      left join public.users as u on (u.id = p.user_id)
    where b.id = check_user_checks.book_id
      and u.id = auth.uid()
      and u.is_blocked is not true;
    return access > 0;
  end;
$$;

ALTER FUNCTION "public"."check_user_checks"("book_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_user_notes"("material_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  declare
    access int;
  begin
    select
      count(m.id) into access
    from
      public.materials as m
      inner join public.checks as c on (c.id = m.check_id)
      inner join public.books as b on (b.id = c.book_id)
      inner join public.projects as p on (p.id = b.project_id)
      inner join public.users as u on (u.id = p.user_id)
    where
      m.id = check_user_notes.material_id
      and m.deleted_at is null
      and c.deleted_at is null
      and p.deleted_at is null
      and u.id = auth.uid()
      and u.is_blocked is not true;
    return access > 0;
  end;
$$;

ALTER FUNCTION "public"."check_user_notes"("material_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_book"("p_project_id" bigint, "book_name" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    book_id BIGINT;
    book_exists BOOLEAN;
    result JSONB;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.books AS b
        WHERE b.project_id = p_project_id AND b.name = book_name AND b.deleted_at IS NULL
    ) INTO book_exists;

    IF book_exists THEN
        RAISE EXCEPTION 'A book with name % already exists for this project', book_name;
    ELSE
        INSERT INTO public.books (name, project_id)
        VALUES (book_name, p_project_id)
        RETURNING id INTO book_id;

        result := jsonb_build_object('book_id', book_id);

        RETURN result;
    END IF;
END;
$$;

ALTER FUNCTION "public"."create_book"("p_project_id" bigint, "book_name" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_check"("p_name" "text", "p_book_id" bigint) RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_check_id uuid;
BEGIN
    INSERT INTO public.checks (name, book_id)
    VALUES (p_name, p_book_id)
    RETURNING id INTO v_check_id;

    RETURN v_check_id;
END;
$$;

ALTER FUNCTION "public"."create_check"("p_name" "text", "p_book_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_project"("p_name" "text") RETURNS bigint
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    project_id bigint;
    project_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.projects
        WHERE user_id = auth.uid() AND name = p_name AND deleted_at IS NULL
    ) INTO project_exists;

    IF project_exists THEN
        RAISE EXCEPTION 'A project with name % already exists for this user', p_name;
    ELSE
        INSERT INTO public.projects (name, user_id)
        VALUES (p_name, auth.uid())
        RETURNING id INTO project_id;

        RETURN project_id;
    END IF;
END;
$$;

ALTER FUNCTION "public"."create_project"("p_name" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."find_token"("token_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    token_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1
        FROM public.tokens
        WHERE id = token_id AND user_id = auth.uid()
    ) INTO token_exists;

    RETURN token_exists;
END;
$$;

ALTER FUNCTION "public"."find_token"("token_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_book_by_id"("book_id" bigint) RETURNS TABLE("book_name" "text", "book_project_id" bigint, "book_deleted_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        name as book_name,
        project_id,
        deleted_at
    FROM
        public.books
    WHERE
        id = get_book_by_id.book_id;
END;
$$;

ALTER FUNCTION "public"."get_book_by_id"("book_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_books_by_project"("p_project_id" bigint) RETURNS TABLE("book_id" bigint, "book_name" "text", "book_created_at" timestamp with time zone, "book_deleted_at" timestamp with time zone)
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
        project_id = p_project_id;
END;
$$;

ALTER FUNCTION "public"."get_books_by_project"("p_project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_check_info"("check_id" "uuid", "user_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    check_info json;
BEGIN
    SELECT json_build_object(
        'check_name', c.name,
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

ALTER FUNCTION "public"."get_check_info"("check_id" "uuid", "user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_checks_for_book"("book_id_param" bigint) RETURNS TABLE("check_id" "uuid", "check_name" "text", "check_material_link" "text", "check_created_time" timestamp with time zone, "check_started_time" timestamp with time zone, "check_finished_time" timestamp with time zone)
    LANGUAGE "plpgsql"
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
$$;

ALTER FUNCTION "public"."get_checks_for_book"("book_id_param" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_notes_by_check_id"("p_check_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    p_material_id bigint;
    notes_data JSON;
BEGIN
    -- Получаем материал по check_id
    SELECT id INTO p_material_id
    FROM materials
    WHERE check_id = p_check_id;

    -- Получаем заметки по material_id
    SELECT json_agg(notes)
    INTO notes_data
    FROM notes
    WHERE material_id = p_material_id;

    RETURN notes_data;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
END;
$$;

ALTER FUNCTION "public"."get_notes_by_check_id"("p_check_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_notes_count_for_book"("book_id" bigint) RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
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
$$;

ALTER FUNCTION "public"."get_notes_count_for_book"("book_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_project_by_id"("project_id" bigint) RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN (
    SELECT row_to_json(projects) FROM projects WHERE id = project_id
  );
END;
$$;

ALTER FUNCTION "public"."get_project_by_id"("project_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_project_info"() RETURNS TABLE("project_id" bigint, "project_name" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        id AS project_id,
        name AS project_name
    FROM
        public.projects
    WHERE
        user_id = auth.uid() AND
        deleted_at IS NULL;
END;
$$;

ALTER FUNCTION "public"."get_user_project_info"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  begin
    insert into
      public.users (id, email)
    values
      (new.id, new.email);
    return new;
  end;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."insert_note"("note" "text", "inspector_id" "uuid", "p_check_id" "uuid", "material_id" bigint, "chapter" "text", "verse" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_check record;
BEGIN
    SELECT c.id, m.id, c.finished_at
    INTO current_check
    FROM public.checks AS c
    INNER JOIN public.materials AS m ON m.check_id = c.id
    LEFT JOIN public.inspectors AS i ON i.check_id = c.id
    WHERE c.id = p_check_id
        AND c.deleted_at IS NULL
        AND c.finished_at > now()
        AND (i.id = inspector_id OR inspector_id IS NULL)
        AND m.id = material_id
        AND m.deleted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Check not found';
    END IF;

    -- Вставляем заметку
    INSERT INTO public.notes (note, inspector_id, material_id, chapter, verse)
    VALUES (note, inspector_id, material_id, chapter, verse);

    RETURN true;
END;
$$;

ALTER FUNCTION "public"."insert_note"("note" "text", "inspector_id" "uuid", "p_check_id" "uuid", "material_id" bigint, "chapter" "text", "verse" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_book_name"("book_id" bigint, "new_name" "text") RETURNS "json"
    LANGUAGE "plpgsql"
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
$$;

ALTER FUNCTION "public"."update_book_name"("book_id" bigint, "new_name" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_note"("note_id" bigint, "note" "text", "inspector_id" "uuid", "check_id" "uuid", "material_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  declare
    current_check record;
    note_in_table int8;
  begin
    -- проверить now() так как с учетом часового пояса может не сработать
    select c.id as check_id, i.id as inspector_id, m.id as material_id
    from public.checks as c
      inner join public.inspectors as i
        on (i.check_id = c.id)
      inner join public.materials as m
        on (m.check_id = c.id)
    where c.id = insert_note.check_id
      and c.deleted_at is null
      and c.finished_at > now()
      and i.id = insert_note.inspector_id
      and i.deleted_at is null
      and m.id = insert_note.material_id
      and m.deleted_at is null
    into current_check;
    if current_check.id is null then
      raise exception 'Check not found';
    end if;

    select n.id
    from public.notes as n
    where n.id = update_note.note_id
      and n.deleted_at is null
      and n.inspector_id = update_note.inspector_id
      and n.material_id = update_note.material_id
    into note_in_table;
    if note_in_table is null then
      raise exception 'Check not found';
    end if;

    update public.notes
    set notes.note = update_note.note
    where notes.id = update_note.note_id;
    return true;
  end;
$$;

ALTER FUNCTION "public"."update_note"("note_id" bigint, "note" "text", "inspector_id" "uuid", "check_id" "uuid", "material_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_project_name"("project_id" bigint, "new_name" "text") RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  project_exists boolean;
  result_json json;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM projects WHERE name = new_name AND id != project_id
  ) INTO project_exists;

  IF NOT project_exists THEN
    UPDATE projects SET name = new_name WHERE id = project_id;
    SELECT row_to_json(r) INTO result_json FROM (SELECT * FROM projects WHERE id = project_id) r;
    RETURN result_json;
  ELSE
    RAISE EXCEPTION 'A project with name % already exists', new_name;
  END IF;
END;
$$;

ALTER FUNCTION "public"."update_project_name"("project_id" bigint, "new_name" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."books" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "project_id" bigint NOT NULL,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."books" FORCE ROW LEVEL SECURITY;

ALTER TABLE "public"."books" OWNER TO "postgres";

ALTER TABLE "public"."books" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."books_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."checks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "material_link" "text",
    "book_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "finished_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "started_at" timestamp with time zone
);

ALTER TABLE ONLY "public"."checks" FORCE ROW LEVEL SECURITY;

ALTER TABLE "public"."checks" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."inspectors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "check_id" "uuid" NOT NULL,
    "deleted_at" timestamp with time zone
);

ALTER TABLE "public"."inspectors" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."materials" (
    "id" bigint NOT NULL,
    "content" "json" NOT NULL,
    "check_id" "uuid" NOT NULL,
    "deleted_at" timestamp with time zone
);

ALTER TABLE "public"."materials" OWNER TO "postgres";

ALTER TABLE "public"."materials" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."materials_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."notes" (
    "id" bigint NOT NULL,
    "note" "text",
    "inspector_id" "uuid",
    "material_id" bigint NOT NULL,
    "chapter" "text" NOT NULL,
    "verse" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);

ALTER TABLE "public"."notes" OWNER TO "postgres";

ALTER TABLE "public"."notes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "deleted_at" timestamp with time zone
);

ALTER TABLE ONLY "public"."projects" FORCE ROW LEVEL SECURITY;

ALTER TABLE "public"."projects" OWNER TO "postgres";

ALTER TABLE "public"."projects" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."projects_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."tokens" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL
);

ALTER TABLE "public"."tokens" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "is_admin" boolean DEFAULT false NOT NULL,
    "is_blocked" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."users" OWNER TO "postgres";

ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."checks"
    ADD CONSTRAINT "checks_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."inspectors"
    ADD CONSTRAINT "inspectors_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."materials"
    ADD CONSTRAINT "materials_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."tokens"
    ADD CONSTRAINT "tokens_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

CREATE UNIQUE INDEX "tokens_user_id_name_idx" ON "public"."tokens" USING "btree" ("user_id", "name");

ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id");

ALTER TABLE ONLY "public"."checks"
    ADD CONSTRAINT "checks_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id");

ALTER TABLE ONLY "public"."inspectors"
    ADD CONSTRAINT "inspectors_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "public"."checks"("id");

ALTER TABLE ONLY "public"."materials"
    ADD CONSTRAINT "materials_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "public"."checks"("id");

ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "public"."inspectors"("id");

ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id");

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."tokens"
    ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");

ALTER TABLE "public"."books" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "books.insert.admin_or_user" ON "public"."books" FOR INSERT TO "authenticated" WITH CHECK ("public"."check_user_books"("project_id"));

CREATE POLICY "books.select.admin_or_user" ON "public"."books" FOR SELECT TO "authenticated" USING ((("deleted_at" IS NULL) AND "public"."check_user_books"("project_id")));

CREATE POLICY "books.update.admin_or_user" ON "public"."books" FOR UPDATE TO "authenticated" USING ((("deleted_at" IS NULL) AND "public"."check_user_books"("project_id")));

CREATE POLICY "books_security_policy" ON "public"."books" USING (("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE ("projects"."user_id" = "auth"."uid"()))));

ALTER TABLE "public"."checks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checks.insert.admin_or_user" ON "public"."checks" FOR INSERT TO "authenticated" WITH CHECK ("public"."check_user_checks"("book_id"));

CREATE POLICY "checks.select.admin_or_user" ON "public"."checks" FOR SELECT TO "authenticated" USING ((("deleted_at" IS NULL) AND "public"."admin_or_user"("id")));

CREATE POLICY "checks.update.admin_or_user" ON "public"."checks" FOR UPDATE TO "authenticated" USING ((("deleted_at" IS NULL) AND "public"."admin_or_user"("id")));

CREATE POLICY "checks_security_policy" ON "public"."checks" USING (("book_id" IN ( SELECT "books"."id"
   FROM "public"."books"
  WHERE ("books"."project_id" IN ( SELECT "projects"."id"
           FROM "public"."projects"
          WHERE ("projects"."user_id" = "auth"."uid"()))))));

ALTER TABLE "public"."inspectors" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inspectors.insert.admin_or_user" ON "public"."inspectors" FOR INSERT TO "authenticated" WITH CHECK ("public"."admin_or_user"("check_id"));

CREATE POLICY "inspectors.select.admin_or_user" ON "public"."inspectors" FOR SELECT TO "authenticated" USING ((("deleted_at" IS NULL) AND "public"."admin_or_user"("check_id")));

CREATE POLICY "inspectors.update.admin_or_user" ON "public"."inspectors" FOR UPDATE TO "authenticated" USING ((("deleted_at" IS NULL) AND "public"."admin_or_user"("check_id")));

ALTER TABLE "public"."materials" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "materials.insert.admin_or_user" ON "public"."materials" FOR INSERT TO "authenticated" WITH CHECK ("public"."admin_or_user"("check_id"));

CREATE POLICY "materials.select.admin_or_user" ON "public"."materials" FOR SELECT TO "authenticated" USING ((("deleted_at" IS NULL) AND "public"."admin_or_user"("check_id")));

CREATE POLICY "materials.update.admin_or_user" ON "public"."materials" FOR UPDATE TO "authenticated" USING ((("deleted_at" IS NULL) AND "public"."admin_or_user"("check_id")));

ALTER TABLE "public"."notes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes.select.admin_or_user" ON "public"."notes" FOR SELECT TO "authenticated" USING (("public"."admin_only"() OR (("deleted_at" IS NULL) AND "public"."check_user_notes"("material_id"))));

ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects.insert.admin_or_user" ON "public"."projects" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") OR "public"."admin_only"()));

CREATE POLICY "projects.select.admin_or_user" ON "public"."projects" FOR SELECT TO "authenticated" USING (((("deleted_at" IS NULL) AND ("auth"."uid"() = "user_id")) OR "public"."admin_only"()));

CREATE POLICY "projects.update.admin_or_user" ON "public"."projects" FOR UPDATE TO "authenticated" USING (((("deleted_at" IS NULL) AND ("auth"."uid"() = "user_id")) OR "public"."admin_only"()));

CREATE POLICY "projects_security_policy" ON "public"."projects" USING (("user_id" = "auth"."uid"()));

ALTER TABLE "public"."tokens" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users.select.admin_only" ON "public"."users" FOR SELECT TO "authenticated" USING ("public"."admin_only"());

CREATE POLICY "users.select.authorized" ON "public"."users" FOR SELECT TO "authenticated" USING ("public"."authorized"());

CREATE POLICY "users.update.admin_only" ON "public"."users" FOR UPDATE TO "authenticated" USING ("public"."admin_only"());

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."admin_only"() TO "anon";
GRANT ALL ON FUNCTION "public"."admin_only"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_only"() TO "service_role";

GRANT ALL ON FUNCTION "public"."admin_or_user"("check_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_or_user"("check_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_or_user"("check_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."authorized"() TO "anon";
GRANT ALL ON FUNCTION "public"."authorized"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."authorized"() TO "service_role";

GRANT ALL ON FUNCTION "public"."check_user_books"("project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_books"("project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_books"("project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."check_user_checks"("book_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_checks"("book_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_checks"("book_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."check_user_notes"("material_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_notes"("material_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_notes"("material_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."create_book"("p_project_id" bigint, "book_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_book"("p_project_id" bigint, "book_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_book"("p_project_id" bigint, "book_name" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."create_check"("p_name" "text", "p_book_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."create_check"("p_name" "text", "p_book_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_check"("p_name" "text", "p_book_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."create_project"("p_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_project"("p_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_project"("p_name" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."find_token"("token_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."find_token"("token_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_token"("token_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_book_by_id"("book_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_book_by_id"("book_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_book_by_id"("book_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_books_by_project"("p_project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_books_by_project"("p_project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_books_by_project"("p_project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_check_info"("check_id" "uuid", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_check_info"("check_id" "uuid", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_check_info"("check_id" "uuid", "user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_checks_for_book"("book_id_param" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_checks_for_book"("book_id_param" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_checks_for_book"("book_id_param" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_notes_by_check_id"("p_check_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_notes_by_check_id"("p_check_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_notes_by_check_id"("p_check_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_notes_count_for_book"("book_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_notes_count_for_book"("book_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_notes_count_for_book"("book_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_project_by_id"("project_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_project_by_id"("project_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_project_by_id"("project_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_project_info"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_project_info"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_project_info"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."insert_note"("note" "text", "inspector_id" "uuid", "p_check_id" "uuid", "material_id" bigint, "chapter" "text", "verse" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."insert_note"("note" "text", "inspector_id" "uuid", "p_check_id" "uuid", "material_id" bigint, "chapter" "text", "verse" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_note"("note" "text", "inspector_id" "uuid", "p_check_id" "uuid", "material_id" bigint, "chapter" "text", "verse" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."update_book_name"("book_id" bigint, "new_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_book_name"("book_id" bigint, "new_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_book_name"("book_id" bigint, "new_name" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."update_note"("note_id" bigint, "note" "text", "inspector_id" "uuid", "check_id" "uuid", "material_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_note"("note_id" bigint, "note" "text", "inspector_id" "uuid", "check_id" "uuid", "material_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_note"("note_id" bigint, "note" "text", "inspector_id" "uuid", "check_id" "uuid", "material_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."update_project_name"("project_id" bigint, "new_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_project_name"("project_id" bigint, "new_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_project_name"("project_id" bigint, "new_name" "text") TO "service_role";

GRANT ALL ON TABLE "public"."books" TO "anon";
GRANT ALL ON TABLE "public"."books" TO "authenticated";
GRANT ALL ON TABLE "public"."books" TO "service_role";

GRANT ALL ON SEQUENCE "public"."books_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."books_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."books_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."checks" TO "anon";
GRANT ALL ON TABLE "public"."checks" TO "authenticated";
GRANT ALL ON TABLE "public"."checks" TO "service_role";

GRANT ALL ON TABLE "public"."inspectors" TO "anon";
GRANT ALL ON TABLE "public"."inspectors" TO "authenticated";
GRANT ALL ON TABLE "public"."inspectors" TO "service_role";

GRANT ALL ON TABLE "public"."materials" TO "anon";
GRANT ALL ON TABLE "public"."materials" TO "authenticated";
GRANT ALL ON TABLE "public"."materials" TO "service_role";

GRANT ALL ON SEQUENCE "public"."materials_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."materials_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."materials_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."notes" TO "anon";
GRANT ALL ON TABLE "public"."notes" TO "authenticated";
GRANT ALL ON TABLE "public"."notes" TO "service_role";

GRANT ALL ON SEQUENCE "public"."notes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notes_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";

GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."tokens" TO "anon";
GRANT ALL ON TABLE "public"."tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."tokens" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";

RESET ALL;

--
-- Dumped schema changes for auth and storage
--

CREATE OR REPLACE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();

