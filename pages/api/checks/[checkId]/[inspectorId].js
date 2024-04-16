import { supabaseService } from '@/helpers/supabaseService'

export default async function handler(req, res) {
  const {
    query: { checkId, inspectorId },
    body: { noteId },
    method,
  } = req
  switch (method) {
    case 'GET': // получить заметки инспектора
      try {
        if (!checkId || !inspectorId) {
          return res.status(400).json({ error: 'Missing required parameters' })
        }

        const { data, error } = await supabaseService
          .from('materials')
          .select(`notes(inspector_id, note, chapter, verse, created_at, id)`)
          .eq('check_id', checkId)
          .eq(`notes.inspector_id`, inspectorId)
          .is(`notes.deleted_at`, null)
        if (error) {
          throw error
        }
        if (data.length === 0 || !data[0].notes) {
          return res.status(404).json({ error: 'No notes found for this inspector' })
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
        return res.status(200).json(notes)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'DELETE': // удалить заметку инспектора
      try {
        if (!inspectorId || !noteId) {
          return res.status(400).json({ error: 'Missing required parameters' })
        }
        const { error } = await supabaseService
          .from('notes')
          .update({ deleted_at: new Date() })
          .eq('id', noteId)
          .eq('inspector_id', inspectorId)
        if (error) {
          throw error
        }
        return res.status(200).json({ message: 'Note deleted successfully' })
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
