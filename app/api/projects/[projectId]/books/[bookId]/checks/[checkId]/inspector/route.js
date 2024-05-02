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
  if (!checkId) {
    return Response.json({ error: 'Missing checkId parameter' }, { status: 400 })
  }
  try {
    const { data, error } = await supabase
      .from('inspectors')
      .select('*')
      .eq('check_id', checkId)

    if (error) {
      throw error
    }

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function POST(req, { params: { checkId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { inspectorName } = await req.json()
  if (!inspectorName) {
    return Response.json({ error: 'Inspector name is required' }, { status: 400 })
  }
  if (!checkId) {
    return Response.json({ error: 'Missing checkId parameter' }, { status: 400 })
  }
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('inspectors')
      .insert([
        {
          name: inspectorName,
          check_id: checkId,
        },
      ])
      .single()

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json(data, { status: 201 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function DELETE(req, { params: { checkId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { inspectorId, p_delete_notes } = await req.json()
  if (!inspectorId) {
    return Response.json({ error: 'Inspector id is required' }, { status: 400 })
  }

  const supabase = createClient()
  try {
    const { error } = await supabase.rpc('delete_inspector_and_notes', {
      p_user_id: userId,
      p_inspector_id: inspectorId,
      p_delete_notes,
    })

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json({ message: 'Inspector deleted successfully' }, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
