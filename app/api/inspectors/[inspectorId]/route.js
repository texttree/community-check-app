import { supabaseService } from '@/app/supabase/service'

/**
 * @swagger
 * /api/inspectors/{inspectorId}:
 *   get:
 *     tags:
 *       - Inspector
 *     summary: Check if there are notes for the inspector
 *     description: Returns true if there are notes for the inspector, otherwise false.
 *     parameters:
 *       - in: path
 *         name: inspectorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Returns true if there are notes for the inspector
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 *       400:
 *         description: Missing required parameters or invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

export async function GET(req, { params: { inspectorId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!inspectorId) {
    return Response.json({ error: 'Missing inspectorId parameter' }, { status: 400 })
  }
  try {
    const { data, error } = await supabaseService.rpc('has_notes', {
      inspector_id: inspectorId,
    })

    if (error) {
      throw error
    }

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
