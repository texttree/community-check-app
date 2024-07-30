'use server'

import { supabaseService } from '@/app/supabase/service'
import { getUser } from '@/app/actions/getUser'
import { revalidatePath } from 'next/cache'

export async function createToken(formData) {
  const tokenName = formData.get('tokenName')
  try {
    if (tokenName.trim() === '') {
      throw new Error('Token name is required')
    }
    const user = await getUser()
    const { data: tokens, error: tokenError } = await supabaseService
      .from('tokens')
      .select()
      .eq('name', tokenName)
      .eq('user_id', user.id)
    if (tokenError) {
      throw tokenError
    }
    if (tokens.length > 0) {
      throw new Error('Token already exists')
    }
    const { data, error } = await supabaseService
      .from('tokens')
      .insert({ name: tokenName, user_id: user.id })
      .select()
    if (error) {
      throw error
    }
    revalidatePath('/[lng]/tokens', 'page')
    return { success: true, token: data[0] }
  } catch (error) {
    return { success: false, message: error.message }
  }
}
