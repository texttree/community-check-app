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



CREATE OR REPLACE FUNCTION public.create_project(
    p_name text
)
RETURNS bigint AS $$
DECLARE
    project_id bigint;
BEGIN
    INSERT INTO public.projects (name, user_id)
    VALUES (project_name, auth.uid())
    RETURNING id INTO project_id;

    RETURN project_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION public.create_check(
    p_name text,
    p_book_id bigint
)
RETURNS uuid AS $$
DECLARE
    v_check_id uuid;
BEGIN
    INSERT INTO public.checks (name, book_id)
    VALUES (p_name, p_book_id)
    RETURNING id INTO v_check_id;

    RETURN v_check_id;
END;
$$ LANGUAGE plpgsql;


ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_security_policy
  ON public.projects
  USING (user_id = auth.uid());

CREATE POLICY books_security_policy
  ON public.books
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY checks_security_policy
  ON public.checks
  USING (book_id IN (SELECT id FROM public.books WHERE project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())));

ALTER TABLE public.projects FORCE ROW LEVEL SECURITY;
ALTER TABLE public.books FORCE ROW LEVEL SECURITY;
ALTER TABLE public.checks FORCE ROW LEVEL SECURITY;


CREATE OR REPLACE FUNCTION get_user_project_info()
RETURNS TABLE (
    project_id bigint,
    project_name text
) AS $$
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
$$ LANGUAGE plpgsql;



create policy "users.select.authorized" on public.users
  for select to authenticated using (authorized());
