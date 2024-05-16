import { supabaseService } from '@/helpers/supabaseService'

export async function GET(req, { params: { checkId } }) {
  if (!checkId) {
    return Response.json({ error: 'Missing checkId parameter' }, { status: 400 })
  }
  try {
    const { data, error } = await supabaseService
      .from('checks')
      .select('id, content')
      .eq('id', checkId)

    if (error) {
      throw error
    }

    return Response.json(data[0], { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
