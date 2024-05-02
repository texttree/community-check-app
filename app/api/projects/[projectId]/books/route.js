import { createClient } from '@/app/supabase/service'
import { headers } from 'next/headers'

/**
 * @swagger
 * /api/projects/{projectId}/books:
 *   get:
 *     summary: Get books
 *     description: Get books
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Array of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       401:
 *         description: User is not authorized
 *       500:
 *         description: An error occurred
 *   post:
 *     summary: Create a new book
 *     description: Create a new book
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *             required:
 *             - name
 *     responses:
 *       200:
 *         description: Book created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request
 *       401:
 *         description: User is not authorized
 *       500:
 *         description: An error occurred
 */

export async function GET(req, { params: { projectId } }) {
  const headersList = headers()
  const userId = headersList.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createClient()
  try {
    const { data, error } = await supabase.rpc('get_books_by_project', {
      p_project_id: projectId,
    })

    if (error) {
      throw error
    }

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function POST(req, { params: { projectId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { name } = await req.json()
  if (!name) {
    return Response.json({ error: 'Book name is required' }, { status: 400 })
  }
  const supabase = createClient()
  try {
    const { data: project, error } = await supabase.rpc('create_book', {
      p_project_id: projectId,
      book_name: name,
    })

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json(project, { status: 201 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
