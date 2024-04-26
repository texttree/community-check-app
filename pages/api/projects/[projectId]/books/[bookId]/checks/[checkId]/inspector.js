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
    query: { checkId },
    body: { inspectorName },
    method,
  } = req
  switch (method) {
    case 'GET': // получить Инспекторов
      try {
        if (!checkId) {
          return res.status(400).json({ error: 'Missing checkId parameter' })
        }
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
        if (!inspectorName) {
          return res.status(400).json({ error: 'Missing inspectorName parameter' })
        }
        if (!checkId) {
          return res.status(400).json({ error: 'Missing checkId parameter' })
        }
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
    case 'DELETE': // удалить проверяющего и его заметки при необходимости
      try {
        const { inspectorId, p_delete_notes } = req.body
        if (!inspectorId) {
          return res.status(400).json({ error: 'Missing inspectorId parameter' })
        }
        const { error } = await supabaseService.rpc('delete_inspector_and_notes', {
          p_user_id: userId,
          p_inspector_id: inspectorId,
          p_delete_notes,
        })

        if (error) throw error
        return res.status(200).json({ message: 'Inspector deleted successfully' })
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
