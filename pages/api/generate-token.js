import { generateAndStoreToken } from '@/helpers/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }
  const { user_id } = req.body
  try {
    const accessToken = await generateAndStoreToken(user_id)
    res.status(200).json(accessToken)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
