import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ error: 'No refresh token provided' })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)
    const userId = decoded.sub

    const newAccessToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
      expiresIn: '1m',
    })

    res.json({ newAccessToken })
  } catch (error) {
    console.error('Error refreshing access token:', error.message)
    return res.status(401).json({ error: 'Invalid refresh token' })
  }
}
