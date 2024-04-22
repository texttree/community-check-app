DROP POLICY "inspectors.delete.admin_or_user" ON "public"."inspectors";

CREATE OR REPLACE FUNCTION delete_inspector_and_notes(p_inspector_id uuid)
RETURNS void AS
$$
BEGIN
    UPDATE public.notes
    SET deleted_at = now()
    WHERE inspector_id = p_inspector_id;
    
    UPDATE public.inspectors
    SET deleted_at = now()
    WHERE id = p_inspector_id;
END;
$$
LANGUAGE plpgsql;
