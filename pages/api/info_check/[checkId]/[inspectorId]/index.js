import { supabaseService } from '@/helpers/supabaseService'

export default async function handler(req, res) {
  const {
    query: { inspectorId },
    method,
  } = req

  try {
    switch (method) {
      case 'GET':
        const { data, error } = await supabaseService.rpc('is_deleted_null', {
          p_id: inspectorId,
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
