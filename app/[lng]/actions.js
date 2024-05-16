import { supabaseService } from '../supabase/service'

export async function getUser() {
  const { data: { user } = {} } = await supabaseService.auth.getUser()
  return user
}
