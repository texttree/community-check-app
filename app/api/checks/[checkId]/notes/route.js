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
 *   post:
 *     tags:
 *       - Notes
 *     summary: Insert note
 *     parameters:
 *       - in: path
 *         name: checkId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the check
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
 *                 type: string
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
 *                   type: string
 *                 checkId:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 *   put:
 *     tags:
 *       - Notes
 *     summary: Update note
 *     parameters:
 *       - in: path
 *         name: checkId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the check
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               noteId:
 *                 type: integer
 *               note:
 *                 type: string
 *               inspectorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

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

export async function PUT(req, { params: { checkId } }) {
  const { noteId, note, inspectorId } = await req.json()

  if (!note || !checkId || !noteId || !inspectorId) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseService.rpc('update_note', {
      note_id: noteId,
      note,
      inspector_id: inspectorId,
      check_id: checkId,
    })

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json({ success: data }, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
