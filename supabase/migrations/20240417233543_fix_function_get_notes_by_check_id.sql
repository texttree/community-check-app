CREATE OR REPLACE FUNCTION get_notes_with_inspector_names(p_check_id bigint) 
RETURNS JSON AS 
$$
DECLARE
    p_material_id bigint;
    notes_data JSON;
BEGIN
    -- Получаем материал по check_id
    SELECT id INTO p_material_id
    FROM materials
    WHERE check_id = p_check_id;

    -- Получаем заметки по material_id 
    SELECT json_agg(json_build_object(
                        'chapter', n.chapter,
                        'verse', n.verse,
                        'note', n.note,
                        'inspector_name', i.name
                    ))
    INTO notes_data
    FROM notes n
    LEFT JOIN inspectors i ON n.inspector_id = i.id
    WHERE n.material_id = p_material_id;

    RETURN notes_data;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;
