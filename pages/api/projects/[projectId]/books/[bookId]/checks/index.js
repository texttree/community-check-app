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
    query: { bookId },
    body: { name, checkId },
    method,
  } = req
  switch (method) {
    case 'GET': // получить проверки
      try {
        const { data, error } = await supabase.rpc('get_checks_for_book', {
          book_id_param: bookId,
        })

        if (error) {
          throw error
        }
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'POST': // создать новую проверку
      try {
        const { data: check, error } = await supabase.rpc('create_check', {
          p_name: name,
          p_book_id: parseInt(bookId),
        })
        if (error) throw error
        return res.status(200).json(check)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'DELETE':
      try {
        const { error } = await supabaseService.rpc('soft_delete_check', {
          p_check_id: checkId,
          p_user_id: userId,
        })
        if (error) throw error
        return res.status(200).json({ message: 'Check deleted successfully' })
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
