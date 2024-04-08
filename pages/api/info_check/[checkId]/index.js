import serverApi from '@/helpers/serverApi'

export default async function handler(req, res) {
  const {
    query: { checkId },
    method,
  } = req

  try {
    switch (method) {
      case 'GET':
        let supabase
        try {
          supabase = await serverApi(req, res)
        } catch (error) {
          return res.status(401).json({ error })
        }

        const { data, error } = await supabase.rpc('get_check_and_book_names', {
          checks_id: checkId,
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
