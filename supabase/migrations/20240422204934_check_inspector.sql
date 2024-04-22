CREATE OR REPLACE  FUNCTION is_deleted_null(p_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
    deleted_time timestamp with time zone;
BEGIN
    SELECT deleted_at INTO deleted_time
    FROM public.inspectors
    WHERE id = p_id;
    
    RETURN deleted_time IS NULL;
END;
$$ LANGUAGE plpgsql;
