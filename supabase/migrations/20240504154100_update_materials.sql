drop policy "checks.insert.admin_or_user" on "public"."checks";
drop policy "checks.select.admin_or_user" on "public"."checks";
drop policy "checks.update.admin_or_user" on "public"."checks";
drop policy "checks_security_policy" on "public"."checks";

drop policy "materials.insert.admin_or_user" on "public"."materials";
drop policy "materials.select.admin_or_user" on "public"."materials";
drop policy "materials.update.admin_or_user" on "public"."materials";

drop policy "notes.select.admin_or_user" on "public"."notes";

revoke delete on table "public"."materials" from "anon";
revoke insert on table "public"."materials" from "anon";
revoke references on table "public"."materials" from "anon";
revoke select on table "public"."materials" from "anon";
revoke trigger on table "public"."materials" from "anon";
revoke truncate on table "public"."materials" from "anon";
revoke update on table "public"."materials" from "anon";

revoke delete on table "public"."materials" from "authenticated";
revoke insert on table "public"."materials" from "authenticated";
revoke references on table "public"."materials" from "authenticated";
revoke select on table "public"."materials" from "authenticated";
revoke trigger on table "public"."materials" from "authenticated";
revoke truncate on table "public"."materials" from "authenticated";
revoke update on table "public"."materials" from "authenticated";

revoke delete on table "public"."materials" from "service_role";
revoke insert on table "public"."materials" from "service_role";
revoke references on table "public"."materials" from "service_role";
revoke select on table "public"."materials" from "service_role";
revoke trigger on table "public"."materials" from "service_role";
revoke truncate on table "public"."materials" from "service_role";
revoke update on table "public"."materials" from "service_role";

alter table "public"."materials" drop constraint "materials_check_id_fkey";

alter table "public"."notes" drop constraint "notes_material_id_fkey";

drop function if exists "public"."create_check"(p_name text, p_book_id bigint);

alter table "public"."materials" drop constraint "materials_pkey";
drop index if exists "public"."materials_pkey";
drop table "public"."materials";

alter table "public"."checks" drop column "deleted_at";
alter table "public"."checks" add column "content" jsonb;

alter table "public"."notes" drop column "material_id";
alter table "public"."notes" add column "check_id" uuid not null;
alter table "public"."notes" add constraint "notes_check_id_fkey" FOREIGN KEY (check_id) REFERENCES checks(id) ON DELETE CASCADE not valid;

alter table "public"."notes" validate constraint "notes_check_id_fkey";

drop function if exists "public"."get_checks_for_book"(book_id_param bigint);

drop function if exists "public"."get_notes_count_for_book"(book_id bigint);

drop function if exists "public"."insert_note"(note text, inspector_id uuid, p_check_id uuid, material_id bigint, chapter text, verse text);

drop function if exists "public"."check_user_notes"(material_id bigint);

drop function if exists "public"."get_notes_by_check_id"(p_check_id uuid);

drop function if exists "public"."update_note"(note_id bigint, note text, inspector_id uuid, check_id uuid, material_id bigint);


set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_check(p_name text, p_book_id bigint, user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_check_id uuid;
    user_exists boolean;
BEGIN
    SELECT EXISTS (
        select 1
        from public.books as b, public.projects as p, public.users as u
        WHERE b.id = create_check.p_book_id AND b.project_id = p.id AND p.user_id = u.id AND u.id = create_check.user_id AND u.is_blocked = false)
      INTO user_exists;

    if user_exists then
      INSERT INTO public.checks (name, book_id)
      VALUES (p_name, p_book_id)
      RETURNING id INTO v_check_id;
      RETURN v_check_id;
    ELSE
        RAISE EXCEPTION 'User not found';
    END IF;
END;
$function$
;


CREATE OR REPLACE FUNCTION public.get_check_by_id(check_id uuid, user_id uuid)
 RETURNS TABLE(id uuid, name text, material_link text, content jsonb, book_id bigint, started_at timestamp with time zone, finished_at timestamp with time zone, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    return query SELECT c.id as id, c.name as name, c.material_link as material_link, c.content as content, c.book_id as book_id, c.started_at as started_at, c.finished_at as finished_at, c.created_at as created_at
        from public.checks as c, public.books as b, public.projects as p, public.users as u
        WHERE c.id = get_check_by_id.check_id AND
          b.id = c.book_id AND
          b.project_id = p.id AND
          p.user_id = u.id AND
          u.id = get_check_by_id.user_id AND
          u.is_blocked = false;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_checks_for_book(book_id_param bigint, user_id uuid)
 RETURNS TABLE(check_id uuid, check_name text, check_material_link text, check_created_time timestamp with time zone, check_started_time timestamp with time zone, check_finished_time timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
DECLARE
    user_exists boolean;
BEGIN
    SELECT EXISTS (
        select 1
        from public.books as b, public.projects as p, public.users as u
        WHERE b.id = get_checks_for_book.book_id_param AND b.project_id = p.id AND p.user_id = u.id AND u.id = get_checks_for_book.user_id AND u.is_blocked = false)
      INTO user_exists;

    IF user_exists THEN
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
          book_id = get_checks_for_book.book_id_param;
    ELSE
        RAISE EXCEPTION 'User not found';
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_notes_count_for_book(book_id bigint, user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    result json;
    user_exists boolean;
BEGIN
    SELECT EXISTS (
        select 1
        from public.books as b, public.projects as p, public.users as u
        WHERE b.id = get_notes_count_for_book.book_id AND b.project_id = p.id AND p.user_id = u.id AND u.id = get_notes_count_for_book.user_id AND u.is_blocked = false)
      INTO user_exists;

    if user_exists then
      SELECT json_agg(json_build_object(
          'check_id', subquery.id,
          'notes_count', subquery.notes_count
      ))
      INTO result
      FROM (
          SELECT c.id, COUNT(n.id) AS notes_count
          FROM checks c
          LEFT JOIN notes n ON c.id = n.check_id
          WHERE c.book_id = get_notes_count_for_book.book_id
          GROUP BY c.id
      ) AS subquery;

      RETURN result;
    ELSE
        RAISE EXCEPTION 'User not found';
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_note(note text, inspector_id uuid, check_id uuid, chapter text, verse text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
    current_check boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.checks AS c
        LEFT JOIN public.inspectors AS i ON i.check_id = c.id
        WHERE c.id = insert_note.check_id
            AND c.finished_at > now()
            AND (insert_note.inspector_id IS NULL OR i.id = insert_note.inspector_id)
    )
    INTO current_check;

    IF current_check THEN
    -- Вставляем заметку
        INSERT INTO public.notes (note, inspector_id, check_id, chapter, verse)
        VALUES (note, inspector_id, check_id, chapter, verse);

        RETURN true;
    ELSE
        RAISE EXCEPTION 'Check not found';
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_user_notes(check_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
      c.id = check_user_notes.check_id
      and p.deleted_at is null
      and u.id = auth.uid()
      and u.is_blocked is not true;
    return access > 0;
  end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_notes_by_check_id(check_id uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    notes_data JSON;
BEGIN
    -- Получаем заметки по check_id
    SELECT json_agg(json_build_object(
                        'chapter', n.chapter,
                        'verse', n.verse,
                        'note', n.note,
                        'inspector_name', i.name
                    ))
    INTO notes_data
    FROM notes n
    LEFT JOIN inspectors i ON n.inspector_id = i.id
    WHERE n.check_id = get_notes_by_check_id.check_id;

    RETURN notes_data;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_note(note_id bigint, note text, inspector_id uuid, check_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  declare
    current_check uuid;
    note_in_table int8;
  begin
    -- проверить now() так как с учетом часового пояса может не сработать
    select c.id as check_id
    from public.checks as c
      inner join public.inspectors as i
        on (i.check_id = c.id)
    where c.id = update_note.check_id
      and c.finished_at > now()
      and i.id = update_note.inspector_id
      and i.deleted_at is null
    into current_check;
    if current_check is null then
      raise exception 'Check not found';
    end if;

    select n.id
    from public.notes as n
    where n.id = update_note.note_id
      and n.deleted_at is null
      and n.inspector_id = update_note.inspector_id
      and n.check_id = update_note.check_id
    into note_in_table;
    if note_in_table is null then
      raise exception 'Check not found';
    end if;

    update public.notes
    set note = update_note.note
    where id = update_note.note_id;
    return true;
  end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_or_user(check_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
      and b.deleted_at is null
      and p.deleted_at is null
      and u.id = auth.uid()
      and u.is_blocked is not true;
    return access > 0;
  end;
$function$
;


