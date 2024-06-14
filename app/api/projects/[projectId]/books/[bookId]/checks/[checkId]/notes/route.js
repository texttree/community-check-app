import { supabaseService } from '@/app/supabase/service'

/**
 * @swagger
 * /api/projects/{projectId}/books/{bookId}/checks/{checkId}/notes:
 *   get:
 *     tags:
 *       - Notes
 *     summary: Get notes by check id
 *     description: Returns an array of notes for a given check id
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: checkId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
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
 *       - Notes
 *     summary: Create a new note
 *     description: Creates a new note for a given check id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 example: This is a note
 *               chapter:
 *                 type: integer
 *                 example: 1
 *               verse:
 *                 type: sinteger
 *                 example: 1
 *               inspectorId:
 *                 type: integer
 *                 example: null
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: checkId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Created
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
 *                 inspector_id:
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
