import { checkTokenExistsInDatabase } from './checkToken'

const COM_CHECK_APP = process.env.COM_CHECK_APP

export const checkComCheckAppMiddleware = async (req, res, next) => {
  try {
    if (!COM_CHECK_APP) {
      const tokenResult = await checkTokenExistsInDatabase(req)
      console.log('API GOOD')

      if (!tokenResult) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
    }
    console.log('GOOD')
    next()
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
