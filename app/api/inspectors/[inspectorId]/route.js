import { createClient } from '@/app/supabase/service'

/**
 * @swagger
 * /api/inspectors/{inspectorId}:
 *   get:
 *     tags:
 *       - Inspector
 *     summary: Returns true if there are notes for the inspector
 *     description: Returns true if there are notes for the inspector
 *     parameters:
 *       - in: path
 *         name: inspectorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns true if there are notes for the inspector
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 has_notes:
 *                   type: boolean
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

export async function GET(req, { params: { inspectorId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createClient()
  if (!inspectorId) {
    return Response.json({ error: 'Missing inspectorId parameter' }, { status: 400 })
  }
  try {
    const { data, error } = await supabase.rpc('has_notes', {
      p_inspector_id: inspectorId,
    })

    if (error) {
      throw error
    }

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
