import serverApi from '@/helpers/serverApi'

export default async function handler(req, res) {
  let supabase
  try {
    supabase = await serverApi(req, res)
  } catch (error) {
    return res.status(401).json({ error })
  }

  const {
    query: { bookId },
    body: { name },
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
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
