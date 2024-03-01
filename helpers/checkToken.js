const jwt = require('jsonwebtoken')

export async function processTokenWithUserId(req) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      throw new Error('Unauthorized, no token')
    }
    const userId = req.query.user_id
    if (!userId) {
      throw new Error('Bad Request, no user_id in query')
    }

    const jwtSecret = process.env.JWT_SECRET

    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        throw new Error('Unauthorized: invalid token')
      }

      if (decoded.sub !== userId) {
        throw new Error('Unauthorized: invalid user_id in token')
      }
    })

    return { success: true, message: 'Access is allowed' }
  } catch (error) {
    console.error('Error processing token:', error.message)
    return { success: false, error: error.message }
  }
}

export async function processTokenWithoutUserId(req, userId) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      throw new Error('Unauthorized, no token')
    }
    if (!userId) {
      throw new Error('Bad Request, no user_id in query')
    }

    const jwtSecret = process.env.JWT_SECRET

    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        throw new Error('Unauthorized: invalid token')
      }

      if (decoded.sub !== userId) {
        throw new Error('Unauthorized: invalid user_id in token')
      }
    })

    return { success: true, message: 'Access is allowed' }
  } catch (error) {
    console.error('Error processing token:', error.message)
    return { success: false, error: error.message }
  }
}
