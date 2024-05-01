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
  try {
    const { data, error } = await supabase.rpc('get_book_by_id', {
      book_id: bookId,
    })

    if (error) {
      throw error
    }

    return Response.json(data[0], { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function POST(req, { params: { bookId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { name } = await req.json()
  if (!name) {
    return Response.json({ error: 'Book name is required' }, { status: 400 })
  }
  const supabase = createClient()
  try {
    const { data: book, error } = await supabase.rpc('update_book_name', {
      book_id: bookId,
      new_name: name,
    })

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json(book, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
