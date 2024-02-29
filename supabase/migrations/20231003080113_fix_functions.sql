set check_function_bodies = off;

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
      and c.deleted_at is null
      and b.deleted_at is null
      and p.deleted_at is null
      and u.id = auth.uid()
      and u.is_blocked is not true;
    return access > 0;
  end;
$function$
;

CREATE OR REPLACE FUNCTION public.check_user_books(project_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.check_user_notes(material_id int8)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.insert_note(note text, inspector_id uuid, check_id uuid, material_id int8, chapter text, verse text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  declare
    current_check record;
  begin
    -- проверить now() так как с учетом часового пояса может не сработать
    select c.id as check_id, i.id as inspector_id, m.id as material_id, c.finished_at as check_finished_at
    from public.checks as c
      inner join public.inspectors as i
        on (i.check_id = c.id)
      inner join public.materials as m
        on (m.check_id = m.id)
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

    insert into
      public.notes (note, inspector_id, material_id, chapter, verse)
    values
      (insert_note.note, insert_note.inspector_id, insert_note.material_id, insert_note.chapter, insert_note.verse);
    return true;
  end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_note(note_id int8, note text, inspector_id uuid, check_id uuid, material_id int8)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;


