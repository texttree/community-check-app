import { createClient } from '@/app/supabase/service'

/**
 * @swagger
 * tags:
 *   - Projects
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         name:
 *           type: string
 *           example: RLOB
 *     Projects:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Project'
 * /api/projects:
 *   get:
 *     summary: Get projects for the current user
 *     tags:
 *       - Projects
 *     responses:
 *       200:
 *         description: Array of projects
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Projects'
 *   post:
 *     summary: Create a new project
 *     tags:
 *       - Projects
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the project
 *                 example: RLOB
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: The newly created project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   description: The ID of the newly created project
 *       400:
 *         description: Invalid input, project name is missing or already exists
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a project by ID
 *     tags:
 *       - Projects
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: number
 *                 description: Project ID to delete
 *                 example: 1
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       400:
 *         description: Bad request, project ID is required or unauthorized
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
export async function GET(req) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json(
      {
        error: 'Unauthorized:x-user-id ',
      },
      { status: 401 }
    )
  }
  const supabaseService = createClient()
  try {
    const { data, error } = await supabaseService
      .from('projects')
      .select('id, name')
      .eq('user_id', userId)

    if (error) {
      throw error
    }
    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function POST(req) {
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
    const { data, error } = await supabaseService.rpc('create_project', {
      name,
      user_id: userId,
    })
    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json(data, { status: 201 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function DELETE(req) {
  const userId = req.headers.get('x-user-id')

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let requestData
  try {
    requestData = await req.json()
  } catch (jsonError) {
    return Response.json({ error: 'Invalid request data' }, { status: 400 })
  }

  const { projectId } = requestData

  if (!projectId) {
    return Response.json({ error: 'Project ID is required' }, { status: 400 })
  }

  const supabaseService = createClient()

  try {
    const { error } = await supabaseService
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(null, { status: 200 })
  } catch (catchError) {
    console.error('Unexpected error:', catchError)
    return Response.json({ error: catchError.message }, { status: 500 })
  }
}
