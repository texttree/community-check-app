import { createClient } from '@/app/supabase/service'
import { headers } from 'next/headers'
/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         id:
 *           type: number
 *     ProjectList:
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
 *               $ref: '#/components/schemas/ProjectList'
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
 *     responses:
 *       201:
 *         description: The newly created project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid input, project name is missing or already exists
 *       500:
 *         description: Internal server error
 */
export async function GET(req) {
  const headersList = req.headers
  const userId = headersList.get('x-user-id')
  if (!userId) {
    const headers = req.headers
    const headersObject = {}

    for (const [key, value] of headers.entries()) {
      headersObject[key] = value
    }
    return new Response(
      JSON.stringify({
        headers: headersObject,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      }
    )
  }
  const supabaseService = createClient()
  try {
    const { data, error } = await supabaseService
      .from('projects')
      .select('id, name')
      .eq('user_id', userId)
      .is('deleted_at', null)

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
    const { count, error: projectError } = await supabaseService
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('name', name)
      .is('deleted_at', null)
    if (projectError) {
      return Response.json({ error: projectError }, { status: 400 })
    }
    if (count > 0) {
      return Response.json({ error: 'Project already exists' }, { status: 400 })
    }
    const { data: newProject, error: createError } = await supabaseService
      .from('projects')
      .insert({ name, user_id: userId })
      .select('name, id')
    if (createError) {
      return Response.json({ error: createError }, { status: 400 })
    }

    return Response.json(newProject?.[0], { status: 201 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
