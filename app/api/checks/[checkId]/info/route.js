import { createClient } from '@/app/supabase/service'
import { createClient as createAdminClient } from '@/app/supabase/server'

export async function GET(req, { params: { checkId } }) {
  const adminSupabase = createAdminClient()
  const res = await adminSupabase.auth.getUser()
  const userId = res?.data?.user?.id ?? null
  const supabase = createClient()
  if (!checkId) {
    return Response.json({ error: 'Missing checkId parameter' }, { status: 400 })
  }
  try {
    const { data, error } = await supabase.rpc('get_check_info', {
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
