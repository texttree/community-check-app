import serverApi from '@/helpers/serverApi'
import { supabaseService } from '@/helpers/supabaseService'

export default async function handler(req, res) {
  const {
    query: { checkId },
    body: { note, chapter, verse, materialId, inspectorId },
    method,
  } = req

  switch (method) {
    case 'GET': // получить заметки
      try {
        let supabase
        try {
          supabase = await serverApi(req, res)
        } catch (error) {
          return res.status(401).json({ error })
        }
        const { data: material, error } = await supabase.rpc('get_notes_by_check_id', {
          p_check_id: checkId,
        })

        if (error) {
          throw error
        }
        return res.status(200).json(material)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'POST': // создать новую заметку
      try {
        if (!note || !materialId || !chapter || !verse) {
          return res.status(400).json({ error: 'Missing required parameters' })
        }

        const { data, error } = await supabaseService.rpc('insert_note', {
          note,
          inspector_id: inspectorId ? inspectorId : null,
          p_check_id: checkId,
          material_id: materialId,
          chapter,
          verse,
        })
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
