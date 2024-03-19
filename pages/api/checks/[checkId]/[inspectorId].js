import serverApi from '@/helpers/serverApi'
import { supabaseService } from '@/helpers/supabaseService'

export default async function handler(req, res) {
  const {
    query: { checkId, inspectorId },
    method,
  } = req
  switch (method) {
    case 'GET': // получить заметки инспектора
      let supabase
      try {
        supabase = await serverApi(req, res)
      } catch (error) {
        return res.status(401).json({ error })
      }
      try {
        const { data: material, err } = await supabase
          .from('materials')
          .select()
          .eq('check_id', checkId)
          .single()
        const { data, error } = await supabase
          .from('notes')
          .select()
          .eq('material_id', material.id)
          .eq('inspector_id', inspectorId)

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
