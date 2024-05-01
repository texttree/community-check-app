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
    body: { name, material_link, started_at, finished_at },
    method,
  } = req

  switch (method) {
    case 'GET': // получить проверку
      try {
        const { data, error } = await supabase
          .from('checks')
          .select('*')
          .eq('id', checkId)
          .single()
        if (error) {
          throw error
        }
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'POST': // обновить проверку
      try {
        const { data: check, error } = await supabase
          .from('checks')
          .update([
            {
              name,
              material_link,
              started_at,
              finished_at,
            },
          ])
          .eq('id', checkId)
          .select()
          .single()
        if (error) throw error
        return res.status(200).json(check)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
