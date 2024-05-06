import { createClient } from '@/app/supabase/service'
import { headers } from 'next/headers'

/**
 * @swagger
 */

export async function GET(req, { params: { bookId } }) {
  const headersList = headers()
  const userId = headersList.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createClient()
  if (!bookId) {
    return Response.json({ error: 'Missing bookId parameter' }, { status: 400 })
  }
  try {
    const { data, error } = await supabase.rpc('get_notes_count_for_book', {
      book_id: bookId,
      user_id: userId,
    })

    if (error) {
      throw error
    }

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
