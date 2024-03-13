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
    case 'GET': // получить книгу
      try {
        const { data, error } = await supabase.rpc('get_book_by_id', { book_id: bookId })
        if (error) {
          throw error
        }
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }

    case 'POST': // обновить книгу
      try {
        const { data: book, error } = await supabase.rpc('update_book_name', {
          book_id: bookId,
          new_name: name,
        })

        if (error) {
          throw error
        }

        return res.status(200).json(book)
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['POST', 'GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
