import serverApi from '@/helpers/serverApi'

export default async function handler(req, res) {
  let supabase, userId
  try {
    supabase = await serverApi(req, res)
    const {
      data: {
        user: { id },
      },
    } = await supabase.auth.getUser()
    userId = id
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
        return res.status(200).json(data[0])
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

    case 'DELETE': // удалить книгу
      try {
        const { error: deleteError } = await supabase.rpc('soft_delete_book', {
          p_book_id: bookId,
          p_user_id: userId,
        })
        if (deleteError) {
          throw deleteError
        }
        return res.status(204).end()
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['POST', 'GET', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
