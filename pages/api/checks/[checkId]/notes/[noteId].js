import serverApi from '@/helpers/serverApi'
export default async function handler(req, res) {
  const {
    query: { noteId },

    method,
  } = req
  switch (method) {
    case 'DELETE': // Удалить заметку инспектора
      let supabase
      try {
        supabase = await serverApi(req, res)
      } catch (error) {
        return res.status(401).json({ error })
      }
      try {
        console.log(noteId)
        const { error } = await supabase.from('notes').delete().eq('id', noteId)
        if (error) {
          throw error
        }
      } catch (error) {
        return res.status(500).json({ error })
      }

    default:
      res.setHeader('Allow', ['DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
