import serverApi from '@/helpers/serverApi'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
}

export default async function handler(req, res) {
  let supabase
  try {
    supabase = await serverApi(req, res)
  } catch (error) {
    return res.status(401).json({ error })
  }

  const {
    query: { checkId },
    body: { id, content },
    method,
  } = req

  switch (method) {
    case 'GET': // получить материалы
      try {
        const { data, error } = await supabase
          .from('materials')
          .select()
          .eq('check_id', checkId)

        if (error) {
          throw error
        }
        return res.status(200).json(data?.[0] || null)
      } catch (error) {
        return res.status(404).json({ error })
      }

    case 'POST': // создать новый или обновить существующий материал
      try {
        const postData = {
          content,
          check_id: checkId,
        }
        if (id) {
          postData.id = id
        }
        const { data: material, error } = await supabase
          .from('materials')
          .upsert([postData])
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
