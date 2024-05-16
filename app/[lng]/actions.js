import { supabaseService } from '../supabase/server'

export async function getUser() {
  const { data: { user } = {} } = await supabaseService.auth.getUser()
  return user
}
