import { supabaseService } from '@/app/supabase/service'

export async function GET(req, { params: { checkId, inspectorId } }) {
  if (!checkId || !inspectorId) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 })
  }
  try {
    const { data, error } = await supabaseService
      .from('checks')
      .select(`notes(inspector_id, note, chapter, verse, created_at, id)`)
      .eq('id', checkId)
      .is(`deleted_at`, null)
      .eq(`notes.inspector_id`, inspectorId)
      .is(`notes.deleted_at`, null)

    if (error) {
      throw error
    }

    if (data.length === 0 || !data[0].notes) {
      return Response.json(
        { error: 'No notes found for this inspector' },
        { status: 404 }
      )
    }
    let notes = {}
    data[0].notes.forEach((note) => {
      notes[note.chapter] ??= {}
      notes[note.chapter][note.verse] ??= []
      notes[note.chapter][note.verse].push({
        note: note.note,
        id: note.id,
        created_at: note.created_at,
      })
    })
    return Response.json(notes, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function DELETE(req, { params: { checkId, inspectorId } }) {
  const { noteId } = await req.json()
  if (!noteId || !checkId || !inspectorId) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 })
  }
  try {
    const { error } = await supabaseService
      .from('notes')
      .update({ deleted_at: new Date() })
      .eq('id', noteId)
      .eq('check_id', checkId)
      .eq('inspector_id', inspectorId)
    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json({ message: 'Note deleted successfully' }, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
