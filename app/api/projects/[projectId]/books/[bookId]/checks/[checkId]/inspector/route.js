import { supabaseService } from '@/app/supabase/service'

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
 *                 description: ID of the inspector to delete
 *               delete_all_notes:
 *                 type: boolean
 *                 description: Whether to delete all associated notes with the inspector
 *             required:
 *               - id
 *               - delete_all_notes
 *     responses:
 *       200:
 *         description: Inspector deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
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
    const { data, error } = await supabaseService
      .from('inspectors')
      .select('id, name')
      .eq('check_id', checkId)
      .is('deleted_at', null)

    if (error) {
      throw error
    }

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function POST(req, { params: { checkId } }) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { name } = await req.json()
  if (!name) {
    return Response.json({ error: 'Inspector name is required' }, { status: 400 })
  }
  if (!checkId) {
    return Response.json({ error: 'Missing checkId parameter' }, { status: 400 })
  }

  try {
    const { data: existingInspector } = await supabaseService
      .from('inspectors')
      .select('*')
      .eq('name', name)
      .single()

    if (existingInspector) {
      return Response.json({ error: 'Inspector name must be unique' }, { status: 400 })
    }

    const { data, error } = await supabaseService
      .from('inspectors')
      .insert([
        {
          name,
          check_id: checkId,
        },
      ])
      .select('id,name')

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
  const { id, delete_all_notes } = await req.json()
  if (!id) {
    return Response.json({ error: 'Inspector id is required' }, { status: 400 })
  }

  try {
    const { error } = await supabaseService.rpc('delete_inspector_and_notes', {
      user_id: userId,
      inspector_id: id,
      delete_all_notes: !!delete_all_notes,
    })

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json({ message: 'Inspector deleted successfully' }, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
