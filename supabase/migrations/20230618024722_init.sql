-- functions
create or replace function public.admin_only()
  returns boolean
  language plpgsql security definer as $$
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


create or replace function public.authorized()
  returns boolean
  language plpgsql security definer as $$
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


create or replace function public.admin_or_user(check_id uuid)
  returns boolean
  language plpgsql security definer as $$
  declare
    access int;
  begin
    select
      count(id) into access
    from
      public.checks as c
      inner join public.books as b on (b.id = c.book_id)
      inner join public.projects as p on (p.id = b.project_id)
      inner join public.users as u on (u.id = p.user_id)
    where
      c.id = check_id
      and c.deleted_at is null
      and b.deleted_at is null
      and p.deleted_at is null
      and u.id = auth.uid()
      and u.is_blocked is not true;
    return access > 0;
  end;
$$;

create or replace function public.check_user_books(project_id bigint)
  returns boolean
  language plpgsql security definer as $$
  declare
    access int;
  begin
    if admin_only() then
      return true;
    end if;

    select count(p.id) into access
    from public.projects as p
      left join public.users as u on (u.id = p.user_id)
    where projects.id = check_user_books.project_id
      and u.id = auth.uid()
      and u.is_blocked is not true;
    return access > 0;
  end;
$$;

create or replace function public.check_user_notes(material_id bigint)
  returns boolean
  language plpgsql security definer as $$
  declare
    access int;
  begin
    select
      count(id) into access
    from
      public.materials as m
      inner join public.checks as c on (c.id = m.check_id)
      inner join public.books as b on (b.id = c.book_id)
      inner join public.projects as p on (p.id = b.project_id)
      inner join public.users as u on (u.id = p.user_id)
    where
      m.id = material_id
      and m.deleted_at is null
      and c.deleted_at is null
      and p.deleted_at is null
      and u.id = auth.uid()
      and u.is_blocked is not true;
    return access > 0;
  end;
$$;

create or replace function public.handle_new_user()
  returns trigger
  language plpgsql security definer as $$
  begin
    insert into
      public.users (id, email)
    values
      (new.id, new.email);
    return new;
  end;
$$;

create or replace function public.insert_note(
    note text,
    inspector_id uuid,
    check_id uuid,
    material_id bigint,
    chapter text,
    verse text
  )
  returns boolean
  language plpgsql security definer as $$
  declare
    current_check record;
  begin
    -- проверить now() так как с учетом часового пояса может не сработать
    select c.id as check_id, c.finished_at, i.id as inspector_id, m.id as material_id
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
$$;

create or replace function public.update_note(
    note_id bigint,
    note text,
    inspector_id uuid,
    check_id uuid,
    material_id bigint
  )
  returns boolean
  language plpgsql security definer as $$
  declare
    current_check record;
    note_in_table bigint;
  begin
    -- проверить now() так как с учетом часового пояса может не сработать
    select c.id as check_id, i.id as inspector_id, m.id as material_id
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

-- END functions

-- users
create table if not exists public.users (
    id uuid not null references auth.users(id) primary key,
    email text not null,
    is_admin boolean not null default false,
    is_blocked boolean not null default false
  );

alter table public.users
  enable row level security;

create policy "users.select.authorized" on public.users
  for select to authenticated using (authorized());

create policy "users.update.admin_only" on public.users
  for update to authenticated using (admin_only());

-- END users

-- projects
create table if not exists public.projects (
    id bigint generated by default as identity primary key,
    name text not null,
    user_id uuid not null references users(id),
    deleted_at timestamp with time zone null
  );


alter table public.projects
  enable row level security;

create policy "projects.select.admin_or_user" on public.projects
  for select to authenticated using ((deleted_at is null and auth.uid() = user_id) or admin_only());

create policy "projects.insert.admin_or_user" on public.projects
  for insert to authenticated with check ((deleted_at is null and auth.uid() = user_id) or admin_only());

create policy "projects.update.admin_or_user" on public.projects
  for update to authenticated using ((deleted_at is null and auth.uid() = user_id) or admin_only());

-- END projects

-- books

create table if not exists
  public.books (
    id bigint generated by default as identity primary key,
    name text not null,
    project_id bigint not null references projects(id),
    deleted_at timestamp with time zone null
  );


alter table public.books
  enable row level security;

create policy "books.select.admin_or_user" on public.books
  for select to authenticated using (deleted_at is null and check_user_books(project_id));

create policy "books.insert.admin_or_user" on public.books
  for insert to authenticated with check (deleted_at is null and check_user_books(project_id));

create policy "books.update.admin_or_user" on public.books
  for update to authenticated using (deleted_at is null and check_user_books(project_id));

-- END books

-- checks

create table if not exists
  public.checks (
    id uuid not null default gen_random_uuid() primary key,
    name text not null,
    material_link text null,
    book_id bigint not null references books(id),
    started_at timestamp with time zone not null default now(),
    finished_at timestamp with time zone null,
    deleted_at timestamp with time zone null
  );


alter table public.checks
  enable row level security;

create policy "checks.select.admin_or_user" on public.checks
  for select to authenticated using (deleted_at is null and admin_or_user(id));

create policy "checks.insert.admin_or_user" on public.checks
  for insert to authenticated with check (deleted_at is null and admin_or_user(id));

create policy "checks.update.admin_or_user" on public.checks
  for update to authenticated using (deleted_at is null and admin_or_user(id));

-- END checks

-- inspectors

create table if not exists
  public.inspectors (
    id uuid not null default gen_random_uuid() primary key,
    name text null,
    check_id uuid not null references checks(id),
    deleted_at timestamp with time zone null
  );


alter table public.inspectors
  enable row level security;

create policy "inspectors.select.admin_or_user" on public.inspectors
  for select to authenticated using (deleted_at is null and admin_or_user(check_id));

create policy "inspectors.insert.admin_or_user" on public.inspectors
  for insert to authenticated with check (deleted_at is null and admin_or_user(check_id));

create policy "inspectors.update.admin_or_user" on public.inspectors
  for update to authenticated using (deleted_at is null and admin_or_user(check_id));

-- END inspectors

-- materials

create table if not exists
  public.materials (
    id bigint generated by default as identity primary key,
    content json not null,
    check_id uuid not null references checks(id),
    deleted_at timestamp with time zone null
  );


alter table public.materials
  enable row level security;

create policy "materials.select.admin_or_user" on public.materials
  for select to authenticated using (deleted_at is null and admin_or_user(check_id));

create policy "materials.insert.admin_or_user" on public.materials
  for insert to authenticated with check (deleted_at is null and admin_or_user(check_id));

create policy "materials.update.admin_or_user" on public.materials
  for update to authenticated using (deleted_at is null and admin_or_user(check_id));

-- END materials

-- notes

create table if not exists
  public.notes (
    id bigint generated by default as identity primary key,
    note text null,
    inspector_id uuid null references inspectors(id),
    material_id bigint not null references materials(id),
    chapter text not null,
    verse text not null,
    created_at timestamp with time zone not null default now(),
    deleted_at timestamp with time zone null
  );

alter table public.notes
  enable row level security;

create policy "notes.select.admin_or_user" on public.notes
  for select to authenticated using (admin_only() or (deleted_at is null and check_user_notes(material_id)));

-- END notes

-- triggers

create trigger on_auth_user_created after
  insert
    on auth.users for each row execute function public.handle_new_user();

-- triggers
