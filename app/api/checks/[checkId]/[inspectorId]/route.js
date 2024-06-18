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
 *         deleted_at:
 *           type: string
 *           format: date-time
 *     NotesResponse:
 *       type: object
 *       additionalProperties:
 *         type: object
 *         additionalProperties:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *               id:
 *                 type: string
 *               created_at:
 *                 type: string
 *                 format: date-time
 * /api/checks/{checkId}/{inspectorId}:
 *   get:
 *     tags:
 *       - Notes
 *     summary: Get notes by check id and inspector id
 *     parameters:
 *       - in: path
 *         name: checkId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the check
 *       - in: path
 *         name: inspectorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the inspector
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotesResponse'
 *       400:
 *         description: Missing required parameters
 *       404:
 *         description: No notes found for this inspector
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags:
 *       - Notes
 *     summary: Delete note
 *     parameters:
 *       - in: path
 *         name: checkId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the check
 *       - in: path
 *         name: inspectorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the inspector
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               noteId:
 *                 type: integer
 *
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Internal server error
 */

export async function GET(req, { params: { checkId, inspectorId } }) {
  if (!checkId || !inspectorId) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 })
  }
  try {
    const { data, error } = await supabaseService
      .from('checks')
      .select(`notes(inspector_id, note, chapter, verse, created_at, id)`)
      .eq('id', checkId)
      .is(`deleted_at`, null)
      .eq(`notes.inspector_id`, inspectorId)
      .is(`notes.deleted_at`, null)
      .order('created_at', {
        ascending: true,
        referencedTable: 'notes',
      })
    if (error) {
      throw error
    }

    if (data.length === 0 || !data[0].notes.length) {
      return Response.json(
        { error: 'No notes found for this inspector' },
        { status: 404 }
      )
    }
    let notes = {}
    data[0].notes.forEach((note) => {
      notes[note.chapter] ??= {}
      notes[note.chapter][note.verse] ??= []
      notes[note.chapter][note.verse].push({
        note: note.note,
        id: note.id,
        created_at: note.created_at,
      })
    })
    return Response.json(notes, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function DELETE(req, { params: { checkId, inspectorId } }) {
  const { noteId } = await req.json()
  if (!noteId || !checkId || !inspectorId) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 })
  }
  try {
    const { error } = await supabaseService
      .from('notes')
      .update({ deleted_at: new Date() })
      .eq('id', noteId)
      .eq('check_id', checkId)
      .eq('inspector_id', inspectorId)
    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json({ message: 'Note deleted successfully' }, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
