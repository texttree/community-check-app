import serverApi from '@/helpers/serverApi'
import { supabaseService } from '@/helpers/supabaseService'

export default async function handler(req, res) {
  let supabase, userId
  try {
    supabase = await serverApi(req, res)
    const {
      data: {
        user: { id },
      },
    } = await supabase.auth.getUser()
    userId = id
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

        if (updateError) {
          return res.status(400).json()
        }

        return res.status(200).json(project)

      case 'DELETE': // удалить проект
        const { error: deleteError } = await supabaseService.rpc('delete_project', {
          p_project_id: projectId,
          p_user_id: userId,
        })

        if (deleteError) {
          return res.status(400).json()
        }

        return res.status(204).end()

      default:
        res.setHeader('Allow', ['POST', 'GET', 'DELETE'])
        return res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
