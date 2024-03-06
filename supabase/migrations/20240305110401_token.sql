CREATE TABLE IF NOT EXISTS  public.tokens (
    id SERIAL PRIMARY KEY,
    user_id uuid NOT NULL,
    access_token text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES users (id)
) TABLESPACE pg_default;

CREATE OR REPLACE FUNCTION public.add_token(
    p_access_token text
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.tokens (user_id, access_token)
    VALUES (auth.uid(), p_access_token);
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION public.find_token(
    p_access_token text
)
RETURNS BOOLEAN AS $$
DECLARE
    token_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1
        FROM public.tokens
        WHERE access_token = p_access_token
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
