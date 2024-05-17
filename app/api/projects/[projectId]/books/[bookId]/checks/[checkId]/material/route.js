import { createClient } from '@/app/supabase/service'

/**
 * @swagger
 * tags:
 *   name: Material
 *   description: Material operations
 * components:
 *   schemas:
 *     Material:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Check ID
 *         content:
 *           type: string
 *           description: Material content
 */

/**
 * @swagger
 * /api/projects/{projectId}/books/{bookId}/checks/{checkId}/material:
 *   get:
 *     summary: Get material by check id
 *     tags:
 *       - Material
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *       - in: path
 *         name: checkId
 *         required: true
 *         schema:
 *           type: string
 *         description: Check ID
 *     responses:
 *       200:
 *         description: The material
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 *   post:
 *     summary: Create or update material
 *     tags:
 *       - Material
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *       - in: path
 *         name: checkId
 *         required: true
 *         schema:
 *           type: string
 *         description: Check ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Material content
 *     responses:
 *       201:
 *         description: The material
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

export async function GET(req, { params: { checkId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabaseService = createClient()
  try {
    const { data, error } = await supabaseService
      .from('checks')
      .select('content')
      .eq('id', checkId)

    if (error) {
      throw error
    }

    return Response.json(data?.[0] || null, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function POST(req, { params: { checkId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { content } = await req.json()
  // TODO validate content
  const supabaseService = createClient()
  try {
    const { data: material, error } = await supabaseService
      .from('checks')
      .update([content])
      .eq('id', checkId)
      .single()
      .select('id')

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json(material, { status: 201 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
