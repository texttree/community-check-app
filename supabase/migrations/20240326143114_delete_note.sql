CREATE OR REPLACE FUNCTION delete_note(note_id INTEGER, inspector_id UUID) RETURNS BOOLEAN AS 
$$
DECLARE
    note_deleted BOOLEAN := FALSE;
BEGIN
    BEGIN
        DELETE FROM public.notes AS n WHERE n.id = note_id AND n.inspector_id = delete_note.inspector_id;
        GET DIAGNOSTICS note_deleted = ROW_COUNT;
    EXCEPTION
        WHEN others THEN
            note_deleted := FALSE;
    END;
    RETURN note_deleted;
END;
$$ LANGUAGE plpgsql;
