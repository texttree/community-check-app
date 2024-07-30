'use server'

import { supabaseService } from '@/app/supabase/service'
import { getUser } from '@/app/actions/getUser'
import { revalidatePath } from 'next/cache'

export async function deleteToken(tokenName) {
  try {
    if (!tokenName) {
      throw new Error('Token name is required')
    }

    const user = await getUser()
    const { data, error } = await supabaseService
      .from('tokens')
      .delete()
      .eq('name', tokenName)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    revalidatePath('/[lng]/tokens', 'page')
    return { success: true, token: data[0] }
  } catch (error) {
    console.error('Error deleting token:', error.message)
    return { success: false, message: error.message }
  }
}
