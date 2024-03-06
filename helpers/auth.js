const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const generateJwtSecret = () => {
  return crypto.randomBytes(32).toString('hex')
}

export const generateToken = async () => {
  try {
    process.env.JWT_SECRET = generateJwtSecret()

    const accessToken = jwt.sign({ type: 'access' }, process.env.JWT_SECRET)

    return accessToken
  } catch (error) {
    console.error('Unexpected error:', error.message)
    return null
  }
}
