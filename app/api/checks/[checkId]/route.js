import { supabaseService } from '@/app/supabase/service'

/**
 * @swagger
 * /api/checks/{checkId}:
 *   get:
 *     summary: Get check content by check ID
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: checkId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the check
 *     responses:
 *       200:
 *         description: Successfully retrieved check content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 content:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       chapter:
 *                         type: string
 *                       verseObjects:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             text:
 *                               type: string
 *                             verse:
 *                               type: string
 *       400:
 *         description: Missing checkId parameter
 *       500:
 *         description: Internal server error
 */

export function GET(req, { params: { checkId } }) {
  if (!checkId) {
    return new Response(JSON.stringify({ error: 'Missing checkId parameter' }), {
      status: 400,
    })
  }

  return supabaseService
    .from('checks')
    .select('id, content')
    .eq('id', checkId)
    .then(({ data, error }) => {
      if (error) {
        throw error
      }
      return new Response(JSON.stringify(data[0]), { status: 200 })
    })
    .catch((error) => {
      return new Response(JSON.stringify({ error: error.message || error }), {
        status: 500,
      })
    })
}
