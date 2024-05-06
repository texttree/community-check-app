import { createClient } from '@/app/supabase/service'

export async function GET(req, { params: { inspectorId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createClient()
  if (!inspectorId) {
    return Response.json({ error: 'Missing inspectorId parameter' }, { status: 400 })
  }
  try {
    const { data, error } = await supabase.rpc('is_deleted_null', {
      p_id: inspectorId,
    })

    if (error) {
      throw error
    }

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
