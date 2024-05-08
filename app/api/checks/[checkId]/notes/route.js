import { createClient } from '@/app/supabase/service'

export async function GET(req, { params: { checkId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createClient()
  if (!checkId) {
    return Response.json({ error: 'Missing checkId parameter' }, { status: 400 })
  }
  try {
    const { data, error } = await supabase.rpc('get_notes_by_check_id', {
      check_id: checkId,
      user_id: userId,
    })

    if (error) {
      throw error
    }

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function POST(req, { params: { checkId } }) {
  const { note, chapter, verse, inspectorId } = await req.json()
  if (!note || !chapter || !verse) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 })
  }
  const supabaseService = createClient()
  try {
    const { data, error } = await supabaseService.rpc('insert_note', {
      note,
      inspector_id: inspectorId ?? null,
      check_id: checkId,
      chapter,
      verse,
    })
    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json(data, { status: 201 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
