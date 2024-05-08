import { createClient } from '@/app/supabase/service'

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Operations about books
 *
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Book identifier
 *         name:
 *           type: string
 *           description: Book name
 *
 * paths:
 *   /api/projects/{projectId}/books/{bookId}:
 *     get:
 *       summary: Get a book by ID
 *       tags:
 *         - Books
 *       parameters:
 *         - in: path
 *           name: projectId
 *           description: Project identifier
 *           required: true
 *           schema:
 *             type: string
 *         - in: path
 *           name: bookId
 *           description: Book identifier
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: OK
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Book'
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 *     post:
 *       summary: Update book name
 *       tags:
 *         - Books
 *       parameters:
 *         - in: path
 *           name: projectId
 *           description: Project identifier
 *           required: true
 *           schema:
 *             type: string
 *         - in: path
 *           name: bookId
 *           description: Book identifier
 *           required: true
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: New book name
 *                   example: Book name
 *       responses:
 *         '200':
 *           description: OK
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Book'
 *         '400':
 *           description: Bad Request
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 */

export async function GET(req, { params: { bookId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createClient()
  try {
    const { data, error } = await supabase.rpc('get_book_by_id', {
      book_id: bookId,
      user_id: userId,
    })

    if (error) {
      throw error
    }

    return Response.json(data[0], { status: 200 })
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
    return Response.json({ error: 'Book name is required' }, { status: 400 })
  }
  const supabase = createClient()
  try {
    const { data: book, error } = await supabase.rpc('update_book_name', {
      book_id: bookId,
      new_name: name,
    })

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json(book, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function DELETE(req, { params: { bookId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()
  try {
    const { error } = await supabase.rpc('delete_book', {
      user_id: userId,
      book_id: bookId,
    })

    if (error) {
      throw error
    }

    return Response.json({ message: 'Book deleted successfully' }, { status: 200 })
  } catch (error) {
    if (error.message.includes('Permission denied')) {
      return Response.json(
        { error: 'You do not have permission to delete this book' },
        { status: 403 }
      )
    }
    return Response.json({ error: 'An error occurred during deletion' }, { status: 500 })
  }
}
