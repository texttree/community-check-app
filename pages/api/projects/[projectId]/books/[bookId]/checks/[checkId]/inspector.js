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
    body: { inspectorName },
    method,
  } = req

  switch (method) {
    case 'GET': // получить Инспекторов
      try {
        const { data, error } = await supabase
          .from('inspectors')
          .select('*')
          .eq('check_id', checkId)
        if (error) {
          throw error
        }
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'POST': // создать нового проверяющего
      try {
        const { data, error } = await supabase
          .from('inspectors')
          .insert([
            {
              name: inspectorName,
              check_id: checkId,
            },
          ])
          .single()

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
