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
        const { data: book, error } = await supabase
          .from('books')
          .insert([
            {
              name,
              project_id: projectId,
            },
          ])
          .single()
          .select('id')
        if (error) throw error
        return res.status(200).json(book)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
