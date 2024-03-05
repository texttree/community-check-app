import { supabaseService } from './supabaseService'
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const generateJwtSecret = () => {
  return crypto.randomBytes(32).toString('hex')
}

export const generateAndStoreToken = async (user_id) => {
  try {
    process.env.JWT_SECRET = generateJwtSecret()

    const accessToken = jwt.sign({ type: 'access' }, process.env.JWT_SECRET)

    const { error } = await supabaseService.rpc('add_token', {
      p_user_id: user_id,
      p_access_token: accessToken,
    })

    if (error) {
      console.error('Failed to store token in the database:', error.message)
      return null
    }

    return accessToken
  } catch (error) {
    console.error('Unexpected error:', error.message)
    return null
  }
}
