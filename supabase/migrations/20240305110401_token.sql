CREATE TABLE IF NOT EXISTS public.tokens (
    id uuid default uuid_generate_v4(),
    user_id uuid not null,
    created_at timestamp with time zone DEFAULT now(),
    constraint tokens_pkey primary key (id),
    constraint tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id)
) tablespace pg_default;


CREATE OR REPLACE FUNCTION public.add_token()
RETURNS uuid AS $$
DECLARE
    new_id uuid;
BEGIN
    INSERT INTO public.tokens (user_id)
    VALUES (auth.uid())
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION public.find_token(
    token_id uuid
)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION public.create_project(
    p_name text
)
RETURNS bigint AS $$
DECLARE
    project_id bigint;
BEGIN
    INSERT INTO public.projects (name, user_id)
    VALUES (p_name, auth.uid())
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
