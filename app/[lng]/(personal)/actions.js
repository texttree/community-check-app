import { createClient } from '../supabase/server'

export async function getUser() {
  const supabaseServer = createClient()
  const { data: { user } = {} } = await supabaseServer.auth.getUser()
  return user
}
