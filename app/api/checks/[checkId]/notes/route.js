import { supabaseService } from '@/app/supabase/service'

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         note:
 *           type: string
 *         chapter:
 *           type: string
 *         verse:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         check_id:
 *           type: string
 *           format: uuid
 *         inspector_id:
 *           type: string
 *           format: uuid
 * /api/checks/{checkId}/notes:
 *   get:
 *     tags:
 *       - Checks
 *     summary: Get notes by check id
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 *   post:
 *     tags:
 *       - Checks
 *     summary: Insert note
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *               chapter:
 *                 type: integer
 *               verse:
 *                 type: integer
 *               inspectorId:
 *                 type: integer
 *                 default: null
 *     responses:
 *       201:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 note:
 *                   type: string
 *                 chapter:
 *                   type: integer
 *                 verse:
 *                   type: integer
 *                 inspectorId:
 *                   type: integer
 *                 checkId:
 *                   type: integer
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

export async function GET(req, { params: { checkId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!checkId) {
    return Response.json({ error: 'Missing checkId parameter' }, { status: 400 })
  }
  try {
    const { data, error } = await supabaseService.rpc('get_notes_by_check_id', {
      check_id: checkId,
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

export async function POST(req, { params: { checkId } }) {
  const { note, chapter, verse, inspectorId } = await req.json()
  if (!note || !chapter || !verse) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 })
  }
  try {
    const { data, error } = await supabaseService.rpc('insert_note', {
      note,
      inspector_id: inspectorId ?? null,
      check_id: checkId,
      chapter,
      verse,
    })
    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json(data, { status: 201 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
