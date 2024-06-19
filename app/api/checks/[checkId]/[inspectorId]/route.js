import { supabaseService } from '@/app/supabase/service'

/**
 * @swagger
 * components:
 *   schemas:
 *     Inspector:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Inspector ID
 *         name:
 *           type: string
 *           description: Inspector name
 *         check_id:
 *           type: string
 *           format: uuid
 *           description: Check ID
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           description: Inspector created datetime
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
 *       properties:
 *         chapters:
 *           type: object
 *           additionalProperties:
 *             type: object
 *             properties:
 *               verses:
 *                 type: object
 *                 additionalProperties:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 */

/**
 * @swagger
 * /api/projects/{projectId}/books/{bookId}/checks/{checkId}/inspector:
 *   get:
 *     summary: Returns the list of inspectors for the check
 *     tags:
 *       - Inspector
 *     parameters:
 *       - in: path
 *         name: checkId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the check
 *     responses:
 *       200:
 *         description: List of inspectors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inspector'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Creates a new inspector
 *     tags:
 *       - Inspector
 *     parameters:
 *       - in: path
 *         name: checkId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the check
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the inspector
 *     responses:
 *       201:
 *         description: Inspector created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inspector'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Deletes an inspector and its notes
 *     tags:
 *       - Inspector
 *     parameters:
 *       - in: path
 *         name: checkId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the check
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               delete_all_notes:
 *                 type: boolean
 *             required:
 *               - id
 *               - delete_all_notes
 *     responses:
 *       200:
 *         description: Inspector deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
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

    let notes = { chapters: {} }
    data[0].notes.forEach((note) => {
      notes.chapters[note.chapter] ??= { verses: {} }
      notes.chapters[note.chapter].verses[note.verse] ??= []
      notes.chapters[note.chapter].verses[note.verse].push({
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
