import serverApi from '@/helpers/serverApi'

export default async function handler(req, res) {
  let supabase
  try {
    supabase = await serverApi(req, res)
  } catch (error) {
    return res.status(401).json({ error })
  }

  const {
    query: { projectId },
    body: { name },
    method,
  } = req

  switch (method) {
    case 'GET': // получить книги
      try {
        const { data, error } = await supabase
          .from('books')
          .select()
          .eq('project_id', projectId)

        if (error) {
          throw error
        }
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'POST': // создать новую книгу
      try {
        const bookExists = await supabase.rpc('check_existing_book', {
          project_id: projectId,
          book_name: name,
        })

        if (bookExists.error) throw bookExists.error

        if (bookExists.data) {
          return res
            .status(400)
            .json({ error: 'A book with the same name already exists for this project.' })
        }

        const { data: newBook, error: createError } = await supabase.rpc('create_book', {
          project_id: projectId,
          book_name: name,
        })

        if (createError) throw createError

        return res.status(200).json(newBook)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
