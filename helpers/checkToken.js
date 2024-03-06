import { supabaseService } from './supabaseService'

export async function checkTokenExistsInDatabase(req) {
  try {
    const access_token = req.headers.authorization?.replace('Bearer ', '')
    if (!access_token) {
      // Возвращаем 401 Unauthorized, так как токен отсутствует
      return { success: false, statusCode: 401, errorMessage: 'Unauthorized, no token' }
    }
    const { data, error } = await supabaseService.rpc('find_token', {
      p_access_token: access_token,
    })
    if (error) {
      console.error('Error calling find_token RPC:', error.message)
      return {
        success: false,
        statusCode: 403,
        errorMessage: 'Error calling find_token RPC',
      }
    }

    if (data) {
      return { success: true, data }
    } else {
      return {
        success: false,
        statusCode: 401,
        errorMessage: 'Token not found in the database',
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error.message)
    return { success: false, statusCode: 500, errorMessage: 'Unexpected error occurred' }
  }
}
