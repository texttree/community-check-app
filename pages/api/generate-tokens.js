import { generateAndStoreToken } from '@/helpers/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { userId, email } = req.body
  try {
    const { accessToken, refreshToken } = await generateAndStoreToken(userId, email)
    res.status(200).json({ accessToken, refreshToken })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
