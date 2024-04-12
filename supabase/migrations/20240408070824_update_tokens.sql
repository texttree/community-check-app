set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_token()
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_id uuid;
BEGIN
    INSERT INTO public.tokens (user_id)
    VALUES (auth.uid())
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$function$
;


