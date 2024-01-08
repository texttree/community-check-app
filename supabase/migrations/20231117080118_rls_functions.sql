drop policy "books.insert.admin_or_user" on "public"."books";

drop policy "checks.insert.admin_or_user" on "public"."checks";

drop policy "inspectors.insert.admin_or_user" on "public"."inspectors";

drop policy "materials.insert.admin_or_user" on "public"."materials";

drop policy "projects.insert.admin_or_user" on "public"."projects";



set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_user_checks(book_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.insert_note(note text, inspector_id uuid, check_id uuid, material_id bigint, chapter text, verse text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  declare
    current_check record;
  begin
    -- проверить now() так как с учетом часового пояса может не сработать
    if insert_note.inspector_id is null then
      select c.id as check_id, m.id as material_id, c.finished_at as check_finished_at
      from public.checks as c
        inner join public.materials as m
          on (m.check_id = c.id)
      where c.id = insert_note.check_id
        and c.deleted_at is null
        and c.finished_at > now()
        and m.id = insert_note.material_id
        and m.deleted_at is null
      into current_check;
    else
      select c.id as check_id, i.id as inspector_id, m.id as material_id, c.finished_at as check_finished_at
      from public.checks as c
        inner join public.materials as m
          on (m.check_id = c.id)
        left join public.inspectors as i
          on (i.check_id = c.id)
      where c.id = insert_note.check_id
        and c.deleted_at is null
        and c.finished_at > now()
        and i.id = insert_note.inspector_id
        and i.deleted_at is null
        and m.id = insert_note.material_id
        and m.deleted_at is null
      into current_check;
    end if; 
    if current_check is null then
      raise exception 'Check not found';
    end if;

    insert into
      public.notes (note, inspector_id, material_id, chapter, verse)
    values
      (insert_note.note, insert_note.inspector_id, insert_note.material_id, insert_note.chapter, insert_note.verse);
    return true;
  end;
$function$
;

create policy "books.insert.admin_or_user"
on "public"."books"
as permissive
for insert
to authenticated
with check (check_user_books(project_id));


create policy "checks.insert.admin_or_user"
on "public"."checks"
as permissive
for insert
to authenticated
with check (check_user_checks(book_id));


create policy "inspectors.insert.admin_or_user"
on "public"."inspectors"
as permissive
for insert
to authenticated
with check (admin_or_user(check_id));


create policy "materials.insert.admin_or_user"
on "public"."materials"
as permissive
for insert
to authenticated
with check (admin_or_user(check_id));


create policy "projects.insert.admin_or_user"
on "public"."projects"
as permissive
for insert
to authenticated
with check (((auth.uid() = user_id) OR admin_only()));



