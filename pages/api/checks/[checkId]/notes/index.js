import serverApi from '@/helpers/serverApi'

export default async function handler(req, res) {
  let supabase
  try {
    supabase = await serverApi(req, res)
  } catch (error) {
    return res.status(401).json({ error })
  }

  const {
    query: { checkId },
    body: { note, chapter, verse, materialId, deleted_at },
    method,
  } = req

  switch (method) {
    case 'GET': // получить заметки
      try {
        const { data: material, err } = await supabase
          .from('materials')
          .select()
          .eq('check_id', checkId)
          .single()
        const { data, error } = await supabase
          .from('notes')
          .select()
          .eq(' material_id', material.id)

        if (error) {
          throw error
        }
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'POST': // создать новую заметку
      console.log(note, chapter, verse, materialId, checkId, deleted_at)
      try {
        const { data, error } = await supabase.rpc('insert_note', {
          note,
          inspector_id: null,
          check_id: checkId,
          material_id: materialId,
          chapter,
          verse,
        })

        if (error) console.error(error)
        else console.log(data)
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error: 123 })
      }
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
