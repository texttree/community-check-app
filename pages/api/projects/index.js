import { supabaseService } from '@/helpers/supabaseService'

export default async function handler(req, res) {
  const {
    body: { name },
    method,
  } = req

  const userId = req.headers['x-user-id']

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
   *     summary: Get all projects for the current user
   *     tags:
   *       - Projects
   *     responses:
   *       200:
   *         description: An array of projects
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
   *         description: Invalid input, project name is missing or the project already exists
   *       500:
   *         description: Internal server error
   */
  try {
    switch (method) {
      case 'GET':
        const { data, error } = await supabaseService
          .from('projects')
          .select('id, name')
          .eq('user_id', userId)
          .is('deleted_at', null)

        if (error) {
          throw error
        }
        return res.status(200).json(data)

      case 'POST':
        const { count, error: projectError } = await supabaseService
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('name', name)
          .is('deleted_at', null)
        if (projectError) {
          return res.status(400).json({ error: createError })
        }
        if (count > 0) {
          return res.status(400).json({ error: 'Project already exists' })
        }
        const { data: newProject, error: createError } = await supabaseService
          .from('projects')
          .insert({ name, user_id: userId })
          .select('name, id')
        if (createError) {
          return res.status(400).json({ error: createError })
        }
        return res.status(201).json(newProject?.[0])

      default:
        res.setHeader('Allow', ['POST', 'GET'])
        return res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
