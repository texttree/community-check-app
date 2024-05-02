import { createClient } from '@/app/supabase/server'

export default async function handler(req, res) {
  let supabase
  try {
    supabase = createClient()
  } catch (error) {
    return res.status(401).json({ error })
  }

  const {
    query: { projectId },
    body: { name },
    method,
  } = req
  try {
    switch (method) {
      case 'GET': // получить книги в рамках проекта
        const { data, error } = await supabase.rpc('get_books_by_project', {
          p_project_id: projectId,
        })
        if (error) {
          throw error
        }
        return res.status(200).json(data)

      case 'POST': // создать новую книгу
        const { data: newBook, error: createError } = await supabase.rpc('create_book', {
          p_project_id: projectId,
          book_name: name,
        })
        if (createError) {
          return res.status(400).json(createError)
        }

        return res.status(200).json(newBook)
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
