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
    body: { content },
    method,
  } = req

  switch (method) {
    case 'GET': // получить материалы
      try {
        const { data, error } = await supabase
          .from('materials')
          .select()
          .eq('check_id', checkId)
          .single()

        if (error) {
          throw error
        }
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'POST': // создать новый или обновить существующий материал
      try {
        const { data: material, error } = await supabase
          .from('materials')
          .upsert([
            {
              content,
              check_id: checkId,
            },
          ])
          .single()
          .select('id')
        if (error) throw error
        return res.status(200).json(material)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
