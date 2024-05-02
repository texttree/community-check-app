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

        if (error) {
          throw error
        }

        if (data.length === 0) {
          return res.status(404).json({ error: 'The material was not found' })
        }

        return res.status(200).json(data[0])
      } catch (error) {
        return res.status(500).json({ error: error.message })
      }

    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
