import serverApi from '@/helpers/serverApi'

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
        if (!checkId || !inspectorId) {
          return res.status(400).json({ error: 'Missing required parameters' })
        }

        const { data, error } = await supabase
          .from('materials')
          .select(`notes(inspector_id, note, chapter, verse, created_at)`)
          .eq('check_id', checkId)
          .eq(`notes.inspector_id`, inspectorId)
        if (error) {
          throw error
        }
        if (data.length === 0 || !data[0].notes) {
          return res.status(404).json({ error: 'No notes found for this inspector' })
        }
        return res.status(200).json(data[0].notes)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
