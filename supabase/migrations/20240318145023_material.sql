drop FUNCTION IF EXISTS  public.insert_note;


CREATE OR REPLACE FUNCTION public.insert_note(
    note text, 
    inspector_id uuid, 
    p_check_id uuid, 
    material_id int8, 
    chapter text, 
    verse text
)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS 
$function$
DECLARE
    current_check record;
BEGIN
    SELECT c.id, m.id, c.finished_at
    INTO current_check
    FROM public.checks AS c
    INNER JOIN public.materials AS m ON m.check_id = c.id
    LEFT JOIN public.inspectors AS i ON i.check_id = c.id
    WHERE c.id = p_check_id
        AND c.deleted_at IS NULL
        AND c.finished_at > now()
        AND (i.id = inspector_id OR inspector_id IS NULL)
        AND m.id = material_id
        AND m.deleted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Check not found';
    END IF;

    -- Вставляем заметку
    INSERT INTO public.notes (note, inspector_id, material_id, chapter, verse)
    VALUES (note, inspector_id, material_id, chapter, verse);

    RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION get_notes_by_check_id(p_check_id uuid)
RETURNS JSON
AS $$
DECLARE
    p_material_id bigint;
    notes_data JSON;
BEGIN
    -- Получаем материал по check_id
    SELECT id INTO p_material_id
    FROM materials
    WHERE check_id = p_check_id;

    -- Получаем заметки по material_id
    SELECT json_agg(notes)
    INTO notes_data
    FROM notes
    WHERE material_id = p_material_id;

    RETURN notes_data;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

