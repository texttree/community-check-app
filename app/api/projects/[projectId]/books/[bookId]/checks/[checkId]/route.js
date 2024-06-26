import { supabaseService } from '@/app/supabase/service'

/**
 * @swagger
 * /api/projects/{projectId}/books/{bookId}/checks/{checkId}:
 *   get:
 *     summary: Get check by ID
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Project ID
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Book ID
 *       - in: path
 *         name: checkId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Check ID
 *     responses:
 *       200:
 *         description: Check
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Check'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Update check
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Project ID
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Book ID
 *       - in: path
 *         name: checkId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Check ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckUpdate'
 *     responses:
 *       200:
 *         description: Check
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Check'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete check by ID
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Project ID
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Book ID
 *       - in: path
 *         name: checkId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Check ID
 *     responses:
 *       200:
 *         description: Check deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

export async function GET(req, { params: { checkId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { data, error } = await supabaseService.rpc('get_check_by_id', {
      check_id: checkId,
      user_id: userId,
    })

    if (error) {
      throw error
    }

    return Response.json(data?.[0] ?? null, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function POST(req, { params: { checkId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { name, started_at, finished_at } = await req.json()

  if (!name) {
    return Response.json({ error: 'Check name is required' }, { status: 400 })
  }
  try {
    const { data: check, error } = await supabaseService
      .from('checks')
      .update([
        {
          name,
          started_at,
          finished_at,
        },
      ])
      .eq('id', checkId)
      .select('id, name, material_link, created_at, started_at, finished_at')
      .single()

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json(check, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function DELETE(req, { params: { checkId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { error } = await supabaseService.rpc('soft_delete_check', {
      check_id: checkId,
      user_id: userId,
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ message: 'Check deleted successfully' }, { status: 200 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
