import { createClient } from '@/app/supabase/service'

/**
 * @swagger
 * /api/projects/{projectId}/books/{bookId}/checks:
 *   get:
 *     summary: Returns a list of checks for a book
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the project
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the book
 *     responses:
 *       '200':
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Check'
 *       '400':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 *   post:
 *     summary: Creates a new check for a book
 *     tags:
 *       - Checks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the check
 *                 example: Community Check
 *             required:
 *               - name
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the project
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the book
 *     responses:
 *       '201':
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Check'
 *       '400':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */

export async function GET(req, { params: { bookId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createClient()
  try {
    const { data, error } = await supabase.rpc('get_checks_for_book', {
      book_id: bookId,
      user_id: userId,
    })

    if (error) {
      throw error
    }

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function POST(req, { params: { bookId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { name } = await req.json()
  if (!name) {
    return Response.json({ error: 'Check name is required' }, { status: 400 })
  }
  const supabase = createClient()
  try {
    const { data: check, error } = await supabaseService.rpc('create_check', {
      name,
      book_id: parseInt(bookId),
      user_id: userId,
    })

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json(check, { status: 201 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
