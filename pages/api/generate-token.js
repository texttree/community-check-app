import { generateToken } from '@/helpers/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }
  try {
    const accessToken = await generateToken()
    res.status(200).json(accessToken)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
