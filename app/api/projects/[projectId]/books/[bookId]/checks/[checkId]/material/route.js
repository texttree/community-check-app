import { createClient } from '@/app/supabase/service'
import { headers } from 'next/headers'

/**
 * @swagger
 */

export async function GET(req, { params: { checkId } }) {
  const headersList = headers()
  const userId = headersList.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('materials')
      .select()
      .eq('check_id', checkId)

    if (error) {
      throw error
    }

    return Response.json(data?.[0] || null, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function POST(req, { params: { checkId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, content } = await req.json()
  // TODO validate id and content
  const supabase = createClient()
  try {
    const postData = {
      content,
      check_id: checkId,
    }
    if (id) {
      postData.id = id
    }
    const { data: material, error } = await supabase
      .from('materials')
      .upsert([postData])
      .single()
      .select('id')

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json(material, { status: 201 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
