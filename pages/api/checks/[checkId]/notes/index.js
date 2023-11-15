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
        const { data, error } = await supabase
          .from('notes')
          .select()
          .eq(' material_id', materialId)

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
        const { data, error } = await supabase.from('notes').insert([
          {
            chapter,
            inspector_id: null,
            material_id: materialId,
            note,
            verse,
            deleted_at,
          },
        ])

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
