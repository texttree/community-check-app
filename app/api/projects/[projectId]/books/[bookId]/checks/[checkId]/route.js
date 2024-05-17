import { createClient } from '@/app/supabase/service'

/**
 * @swagger
 * tags:
 *   name: Checks
 *   description: Checks operations
 * components:
 *   schemas:
 *     Check:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Check ID
 *         name:
 *           type: string
 *           description: Check name
 *         material_link:
 *           type: string
 *           description: Check material link
 *         started_at:
 *           type: string
 *           format: date-time
 *           description: Check start datetime
 *         finished_at:
 *           type: string
 *           format: date-time
 *           description: Check finish datetime
 *     CheckUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Check name
 *           example: Community Check
 *         material_link:
 *           type: string
 *           description: Check material link
 *           example: https://git.door43.org/ru_gl/ru_rlob/raw/branch/master/57-TIT.usfm
 *         started_at:
 *           type: string
 *           format: date-time
 *           description: Check start datetime
 *           example: 2024-04-04
 *         finished_at:
 *           type: string
 *           format: date-time
 *           description: Check finish datetime
 *           example: 2025-05-05
 */

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
 */

export async function GET(req, { params: { checkId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createClient()
  try {
    const { data, error } = await supabase.rpc('get_check_by_id', {
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
  const { name, material_link, started_at, finished_at, content } = await req.json()
  if (!name) {
    return Response.json({ error: 'Check name is required' }, { status: 400 })
  }
  // TODO: validate material link, started_at, finished_at
  const supabase = createClient()
  try {
    const { data: check, error } = await supabaseService
      .from('checks')
      .update([
        {
          name,
          material_link,
          started_at,
          finished_at,
          content,
        },
      ])
      .eq('id', checkId)
      .select()
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

  const supabase = createClient()
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
