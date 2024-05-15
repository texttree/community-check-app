import { createClient } from '@/app/supabase/service'

export async function GET(req, { params: { checkId } }) {
  const supabase = createClient()
  if (!checkId) {
    return Response.json({ error: 'Missing checkId parameter' }, { status: 400 })
  }
  try {
    const { data, error } = await supabase.from('checks').select('*').eq('id', checkId)

    if (error) {
      throw error
    }

    return Response.json(data[0], { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
