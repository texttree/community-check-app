import serverApi from '@/helpers/serverApi'

export default async function handler(req, res) {
  let supabase
  try {
    supabase = await serverApi(req, res)
  } catch (error) {
    return res.status(401).json({ error })
  }

  const {
    body: { name },
    method,
  } = req

  switch (method) {
    case 'GET': // получить список проектов
      try {
        const { data, error } = await supabase.from('projects').select('*')
        if (error) {
          throw error
        }
        return res.status(200).json(data)
      } catch (error) {
        return res.status(401).json({ error })
      }

    case 'POST': // создать новый проект
      try {
        const user_id = (await supabase.auth.getUser()).data.user.id
        const { data: project, error } = await supabase
          .from('projects')
          .insert([
            {
              name,
              user_id,
            },
          ])
          .single()
          .select('id')
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
