import { supabaseService } from '@/helpers/supabaseService'
import serverApi from '@/helpers/serverApi'

export default async function handler(req, res) {
  let userId

  const {
    query: { checkId },
    method,
  } = req

  try {
    const _supabase = await serverApi(req, res)
    const {
      data: {
        user: { id },
      },
    } = await _supabase.auth.getUser()
    userId = id
  } catch (Error) {
    userId = null
  }

  try {
    switch (method) {
      case 'GET':
        const { data, error } = await supabaseService.rpc('get_check_info', {
          check_id: checkId,
          user_id: userId,
        })
        if (error) {
          throw error
        }

        return res.status(200).json(data)

      default:
        res.setHeader('Allow', ['GET'])
        return res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
