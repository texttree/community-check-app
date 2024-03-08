import serverApi from '@/helpers/serverApi'
import { checkComCheckAppMiddleware } from '@/middleware'

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

  try {
    switch (method) {
      case 'GET': // получить книги
        const { data, error } = await supabase
          .from('books')
          .select()
          .eq('project_id', projectId)

        if (error) {
          throw error
        }
        return res.status(200).json(data)

      case 'POST': // создать новую книгу
        await checkComCheckAppMiddleware(supabase, req, res, async () => {
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
        })
        break
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
