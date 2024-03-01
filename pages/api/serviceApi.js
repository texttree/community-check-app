import { processTokenWithUserId } from '@/helpers/checkToken'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  const result = await processTokenWithUserId(req)

  if (result.success) {
    res.status(200).json({ message: result.message })
  } else {
    res
      .status(401)
      .json({ error: result.error, customMessage: 'Your custom message here' })
  }
}
