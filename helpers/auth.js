const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const generateJwtSecret = () => {
  return crypto.randomBytes(32).toString('hex')
}

export const generateAndStoreToken = async (userId, email) => {
  try {
    process.env.JWT_SECRET = generateJwtSecret()

    const accessToken = jwt.sign(
      { sub: userId, name: email, type: 'access' },
      process.env.JWT_SECRET,
      {
        expiresIn: '1m',
      }
    )

    const refreshToken = jwt.sign(
      { sub: userId, name: email, type: 'refresh' },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    )

    return { accessToken, refreshToken }
  } catch (error) {
    console.error('Unexpected error:', error.message)
    return null
  }
}
