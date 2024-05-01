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
    const { data, error } = await supabase.rpc('get_checks_for_book', {
      book_id_param: bookId,
    })

    if (error) {
      throw error
    }

    return Response.json(data, { status: 200 })
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
    return Response.json({ error: 'Check name is required' }, { status: 400 })
  }
  const supabase = createClient()
  try {
    const { data: check, error } = await supabase.rpc('create_check', {
      p_name: name,
      p_book_id: parseInt(bookId),
    })

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json(check, { status: 201 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
