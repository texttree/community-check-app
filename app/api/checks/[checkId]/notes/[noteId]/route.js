import { supabaseService } from '@/app/supabase/service'

/**
 * @swagger
 * /api/checks/{checkId}/notes/{noteId}:
 *   post:
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
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the note
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *               inspectorId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

export async function POST(req, { params: { checkId, noteId } }) {
  const { note, inspectorId } = await req.json()
  if (!note || !checkId || !noteId || !inspectorId) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  try {
    const { error } = await supabaseService.rpc('update_note', {
      note_id: noteId,
      note,
      inspector_id: inspectorId,
      check_id: checkId,
    })

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json({ message: 'Note updated successfully' }, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
