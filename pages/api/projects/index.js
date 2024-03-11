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
        return res.status(404).json({ error })
      }

    case 'POST': // создать новый проект
      try {
        const projectExists = await supabase.rpc('check_existing_project', {
          project_name: name,
        })

        if (projectExists.error) throw projectExists.error

        if (projectExists.data) {
          return res
            .status(400)
            .json({ error: 'A project with the same name already exists for this user.' })
        }

        const { data: newProject, error: createError } = await supabase.rpc(
          'create_project',
          { project_name: name }
        )
        if (createError) throw createError

        return res.status(200).json(newProject)
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['POST', 'GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
