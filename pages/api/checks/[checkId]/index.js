import { supabaseService } from '@/helpers/supabaseService'

export default async function handler(req, res) {
  const {
    query: { checkId },
    method,
  } = req

  switch (method) {
    case 'GET': // получить материалы
      try {
        const { data, error } = await supabaseService
          .from('materials')
          .select('id, content')
          .eq('check_id', checkId)
          .single()
        if (error) {
          throw error
        }
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
