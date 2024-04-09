DROP TABLE IF EXISTS public.tokens CASCADE;

CREATE TABLE public.tokens (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    token UUID NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    name TEXT NULL,
    CONSTRAINT tokens_pkey PRIMARY KEY (id),
    CONSTRAINT tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id)
) TABLESPACE pg_default;


DROP FUNCTION IF EXISTS public.add_token;

CREATE OR REPLACE FUNCTION public.add_token(p_name text)
RETURNS uuid AS $$
DECLARE
    new_token uuid;
BEGIN
    IF TRIM(p_name) = '' THEN
        RAISE EXCEPTION 'Token name cannot be empty';
    END IF;

    IF EXISTS (SELECT 1 FROM public.tokens WHERE user_id = auth.uid() AND LOWER(name) = LOWER(TRIM(p_name))) THEN
        RAISE EXCEPTION 'Token with name % already exists for the current user', TRIM(p_name);
    END IF;

    INSERT INTO public.tokens (user_id, name)
    VALUES (auth.uid(), LOWER(TRIM(p_name)))
    RETURNING token INTO new_token;
    
    RETURN new_token;
END;
$$ LANGUAGE plpgsql;
