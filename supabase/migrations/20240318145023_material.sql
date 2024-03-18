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
    SELECT c.id, i.id, m.id, c.finished_at
    INTO current_check
    FROM public.checks AS c
    INNER JOIN public.inspectors AS i ON i.check_id = c.id
    INNER JOIN public.materials AS m ON m.check_id = c.id
    WHERE c.id = p_check_id 
        AND c.deleted_at IS NULL
        AND c.finished_at > now()
        AND (i.id = inspector_id OR inspector_id IS NULL) -- Учитываем возможность NULL
        AND i.deleted_at IS NULL
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
