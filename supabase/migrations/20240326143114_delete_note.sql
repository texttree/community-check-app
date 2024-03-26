CREATE OR REPLACE FUNCTION delete_note(note_id INTEGER) RETURNS BOOLEAN AS 
$$
DECLARE
    note_deleted BOOLEAN := FALSE;
BEGIN
    DELETE FROM public.notes WHERE id = note_id;
    
    GET DIAGNOSTICS note_deleted = ROW_COUNT;
    
    RETURN note_deleted;
END;
$$ LANGUAGE plpgsql;
