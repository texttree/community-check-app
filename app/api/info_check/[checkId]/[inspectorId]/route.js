import { createClient } from '@/app/supabase/service'

export async function GET(req, { params: { checkId, inspectorId } }) {
  const supabase = createClient()
  if (!inspectorId || !checkId) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 })
  }
  try {
    const { data, error } = await supabase.rpc('is_inspector_deleted', {
      inspector_id: inspectorId,
    })

    if (error) {
      throw error
    }

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
