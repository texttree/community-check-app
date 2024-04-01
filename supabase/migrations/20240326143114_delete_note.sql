CREATE OR REPLACE FUNCTION delete_note(note_id INTEGER, inspector_id UUID) RETURNS BOOLEAN AS 
$$
DECLARE
    note_deleted BOOLEAN := FALSE;
BEGIN
    IF EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND inspector_id = delete_note.inspector_id) THEN
        DELETE FROM public.notes WHERE id = note_id AND inspector_id = delete_note.inspector_id;
        
        GET DIAGNOSTICS note_deleted = ROW_COUNT;
    ELSE
        note_deleted := FALSE;
    END IF;
    
    RETURN note_deleted;
EXCEPTION

    WHEN others THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
