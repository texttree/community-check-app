'use server'

import { supabaseService } from '@/app/supabase/service'

export async function getTokens(userId) {
  try {
    const { data: tokens, error } = await supabaseService
      .from('tokens')
      .select('name, created_at')
      .eq('user_id', userId)
    if (error) throw error
    return tokens
  } catch (error) {
    return error
  }
}
