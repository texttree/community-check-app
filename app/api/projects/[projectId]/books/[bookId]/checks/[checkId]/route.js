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
    const { data, error } = await supabase.rpc('get_check_by_id', {
      check_id: checkId,
      user_id: userId,
    })
    // .from('checks')
    // .select('*')
    // .eq('id', checkId)
    // .single()

    if (error) {
      throw error
    }

    return Response.json(data?.[0] ?? null, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function POST(req, { params: { checkId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { name, material_link, started_at, finished_at } = await req.json()
  if (!name) {
    return Response.json({ error: 'Check name is required' }, { status: 400 })
  }
  // TODO: validate material link, started_at, finished_at
  const supabase = createClient()
  try {
    const { data: check, error } = await supabase
      .from('checks')
      .update([
        {
          name,
          material_link,
          started_at,
          finished_at,
        },
      ])
      .eq('id', checkId)
      .select()
      .single()

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json(check, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
