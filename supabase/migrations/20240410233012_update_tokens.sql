DROP TABLE IF EXISTS public.tokens CASCADE;

CREATE TABLE public.tokens (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    name TEXT NULL,
    CONSTRAINT tokens_pkey PRIMARY KEY (id),
    CONSTRAINT tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id)
) TABLESPACE pg_default;


DROP FUNCTION IF EXISTS public.get_tokens;

CREATE OR REPLACE FUNCTION get_tokens()
RETURNS TABLE (p_name text, p_created_at timestamp with time zone)
AS $$
BEGIN
    RETURN QUERY
    SELECT name, created_at
    FROM public.tokens
    WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS public.delete_token;

CREATE OR REPLACE FUNCTION public.delete_token(token_name text)
RETURNS void AS $$
BEGIN
    DELETE FROM public.tokens WHERE name = token_name;
END;
$$ LANGUAGE plpgsql;