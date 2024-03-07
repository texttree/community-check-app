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
        WHERE id = token_id
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
