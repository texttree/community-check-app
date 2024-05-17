import { createClient } from '@/app/supabase/service'

/**
 * @swagger
 * tags:
 *   - Books
 * /api/projects/{projectId}:
 *   get:
 *     summary: Returns a project by ID.
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       401:
 *         description: User is not authorized
 *       500:
 *         description: An error occurred
 *   post:
 *     summary: Updates the project name.
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: New project name
 *                 example: RSOB
 *     responses:
 *       200:
 *         description: Project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Error in request
 *       401:
 *         description: User is not authorized
 *       500:
 *         description: An error occurred
 */

export async function GET(req, { params: { projectId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json(
      {
        error: 'Unauthorized',
      },
      { status: 401 }
    )
  }
  const supabaseService = createClient()
  try {
    const { data, error } = await supabaseService.rpc('get_project_by_id', {
      project_id: projectId,
    })

    if (error) {
      throw error
    }

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function POST(req, { params: { projectId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { name } = await req.json()
  if (!name) {
    return Response.json({ error: 'Project name is required' }, { status: 400 })
  }
  const supabaseService = createClient()
  try {
    const { data: project, error: updateError } = await supabaseService.rpc(
      'update_project_name',
      {
        project_id: projectId,
        new_name: name,
      }
    )

    if (updateError) {
      return Response.json({ error: updateError }, { status: 400 })
    }

    return Response.json(project, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
