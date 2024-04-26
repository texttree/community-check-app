CREATE POLICY "inspectors.delete.admin_or_user" ON "public"."inspectors" FOR delete TO "authenticated" USING ((("deleted_at" IS NULL) AND "public"."admin_or_user"("check_id")));

CREATE OR REPLACE FUNCTION delete_inspector_and_notes(p_inspector_id uuid)
RETURNS void AS $$
BEGIN
    DELETE FROM public.notes WHERE inspector_id = p_inspector_id;
    DELETE FROM public.inspectors WHERE id = p_inspector_id;
END;
$$ LANGUAGE plpgsql;
