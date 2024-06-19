import { supabaseService } from '@/app/supabase/service'

/**
 * @swagger
 * /api/tokens/validate:
 *   get:
 *     summary: Validate user token
 *     description: Checks if the provided token exists and belongs to the user.
 *     tags:
 *       - Token
 
 *     responses:
 *       200:
 *         description: Token is valid.
 *       401:
 *         description: Unauthorized or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error message
 */

export async function GET(req) {
  const userId = req.headers.get('x-user-id')
  const access_token = req.headers.get('x-comcheck-token')
  try {
    if (!userId || !access_token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ message: 'Token is valid' }, { status: 200 })
  } catch (error) {
    return Response.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}
