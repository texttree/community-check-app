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

  try {
    switch (method) {
      case 'GET': // получить проект
        const { data, error } = await supabase.rpc('get_project_by_id', {
          project_id: projectId,
        })

        if (error) {
          throw error
        }

        return res.status(200).json(data)

      case 'POST': // обновить проект
        const { data: project, error: updateError } = await supabase.rpc(
          'update_project_name',
          {
            project_id: projectId,
            new_name: name,
          }
        )
        if (!project.result) {
          return res
            .status(400)
            .json({ error: `A project with that name already exists` })
        }

        return res.status(200).json(project)

      default:
        res.setHeader('Allow', ['POST', 'GET'])
        return res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
