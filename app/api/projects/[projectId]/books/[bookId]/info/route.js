import { supabaseService } from '@/app/supabase/service'

/**
 * @swagger
 * /api/projects/{projectId}/books/{bookId}/info:
 *   get:
 *     summary: Get count of notes for book
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notes count
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   check_name:
 *                     type: string
 *                     description: Name of the check
 *                   notes_count:
 *                     type: integer
 *                     description: Notes count for the check
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Unauthorized
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Invalid request
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Internal Server Error
 */

export function GET(req, { params: { bookId } }) {
  const userId = req.headers.get('x-user-id')

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  if (!bookId) {
    return new Response(JSON.stringify({ error: 'Missing bookId parameter' }), {
      status: 400,
    })
  }

  return supabaseService
    .rpc('get_notes_count_for_book', {
      book_id: bookId,
      user_id: userId,
    })
    .then((response) => {
      const { data, error } = response
      if (error) {
        throw error
      }
      return new Response(JSON.stringify(data), { status: 200 })
    })
    .catch((error) => {
      return new Response(JSON.stringify({ error: error.message || error }), {
        status: 500,
      })
    })
}
