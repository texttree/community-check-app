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

