import serverApi from '@/helpers/serverApi'

export default async function handler(req, res) {
  let supabase
  try {
    supabase = await serverApi(req, res)
  } catch (error) {
    return res.status(401).json({ error })
  }

  const {
    query: { projectId },
    body: { name },
    method,
  } = req

  switch (method) {
    case 'GET': // получить проект
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single()
        if (error) {
          throw error
        }
        return res.status(200).json(data)
      } catch (error) {
        return res.status(401).json({ error })
      }

    case 'POST': // обновить проект
      try {
        const { data: project, error } = await supabase
          .from('projects')
          .update({
            name,
          })
          .eq('id', projectId)
          .select()
        if (error) throw error
        return res.status(200).json(project)
      } catch (error) {
        return res.status(401).json({ error })
      }

    default:
      res.setHeader('Allow', ['POST', 'GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
