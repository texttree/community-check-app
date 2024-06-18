import { supabaseService } from '@/app/supabase/service'

/**
 * @swagger
 * components:
 *   schemas:
 *     Check:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "1a2b3c4d"
 *         name:
 *           type: string
 *           example: "Check 1"
 *         project_id:
 *           type: number
 *           example: 1
 *         book_id:
 *           type: number
 *           example: 1
 * /api/projects/fast:
 *   post:
 *     summary: Create a fast project, books and check
 *     tags:
 *       - Fast
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_name:
 *                 type: string
 *                 description: Name of the project
 *                 example: "Project A"
 *               book_name:
 *                 type: string
 *                 description: Name of the book
 *                 example: "Book 1"
 *               check_name:
 *                 type: string
 *                 description: Name of the check
 *                 example: "Check 1"
 *     responses:
 *       201:
 *         description: Check created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project_id:
 *                   type: number
 *                   description: The ID of the project
 *                 book_id:
 *                   type: number
 *                   description: The ID of the book
 *                 check_id:
 *                   type: string
 *                   description: The ID of the created check
 *       400:
 *         description: Bad request, missing project_name, book_name, or check_name
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

export async function POST(req) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { project_name, book_name, check_name } = await req.json()

  if (!project_name || !book_name || !check_name) {
    return Response.json({ error: 'Name is required' }, { status: 400 })
  }
  try {
    const { data, error } = await supabaseService.rpc('create_project_book_check', {
      user_id: userId,
      project_name,
      book_name,
      check_name,
    })
    if (error) {
      return Response.json({ error }, { status: 400 })
    }
    return Response.json(
      {
        project_id: data.project_id,
        book_id: data.book_id,
        check_id: data.check_id,
      },
      { status: 201 }
    )
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
