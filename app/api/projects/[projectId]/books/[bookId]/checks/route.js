import { supabaseService } from '@/app/supabase/service'

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
 *       '401':
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
 *               url:
 *                 type: string
 *                 description: The URL of the material
 *                 example: https://example.com/material
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the check
 *                 example: 2023-01-01
 *             required:
 *               - name
 *               - url
 *               - startDate
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
 *         description: Bad request
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */

export async function GET(req, { params: { bookId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { data, error } = await supabaseService.rpc('get_checks_for_book', {
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
  const { name, url, startDate } = await req.json()
  if (!name) {
    return Response.json({ error: 'Check name is required' }, { status: 400 })
  }
  try {
    const { data: check, error } = await supabaseService.rpc('create_check', {
      check_name: name,
      check_material_link: url,
      check_started_at: startDate,
      check_finished_at: startDate,
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
