import serverApi from '@/helpers/serverApi'
import { checkComCheckAppMiddleware } from '@/middleware'

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

  try {
    switch (method) {
      case 'GET': // получить список проектов
        const { data, error } = await supabase.rpc('get_user_project_info')

        if (error) {
          throw error
        }
        return res.status(200).json(data)

      case 'POST': // создать новый проект
        await checkComCheckAppMiddleware(supabase, req, res, async () => {
          const { data: newProject, error: createError } = await supabase.rpc(
            'create_project',
            { p_name: name }
          )

          if (createError) {
            return res.status(400).json()
          }
          return res.status(200).json(newProject)
        })

        break
      default:
        res.setHeader('Allow', ['POST', 'GET'])
        return res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
