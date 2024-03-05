import { supabaseService } from './supabaseService'

export async function checkTokenExistsInDatabase(req) {
  try {
    const access_token = req.headers.authorization?.replace('Bearer ', '')
    if (!access_token) {
      throw new Error('Unauthorized, no token')
    }
    const { data, error } = await supabaseService.rpc('find_token', {
      p_access_token: access_token,
    })
    if (error) {
      console.error('Error calling find_token RPC:', error.message)
      return false
    }
    return data
  } catch (error) {
    console.error('Unexpected error:', error.message)
    return false
  }
}
