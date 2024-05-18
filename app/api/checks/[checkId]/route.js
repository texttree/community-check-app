import { supabaseService } from '@/app/supabase/service'

export async function GET(req, { params: { checkId } }) {
  if (!checkId) {
    return Response.json({ error: 'Missing checkId parameter' }, { status: 400 })
  }
  try {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    const { data, error } = await supabaseService
      .from('checks')
      .select('id, content')
      .eq('id', checkId)

    await delay(100)

    if (error) {
      throw error
    }

    return Response.json(data[0], { status: 200 })
  } catch (error) {
    return Response.json({ error: error.message || error }, { status: 500 })
  }
}
