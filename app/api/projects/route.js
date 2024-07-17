import { supabaseService } from '@/app/supabase/service'

/**
 * @swagger
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
 *       401:
 *         description: Unauthorized, missing x-user-id header
 *       500:
 *         description: Internal server error
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
 *     responses:
 *       200:
 *         description: The newly created project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid input, project name is missing or already exists
 *       401:
 *         description: Unauthorized
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
  try {
    const { data, error } = await supabaseService.rpc('create_project', {
      name,
      user_id: userId,
    })
    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
