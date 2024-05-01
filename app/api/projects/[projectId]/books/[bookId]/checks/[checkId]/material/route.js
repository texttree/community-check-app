import { createClient } from '@/app/supabase/service'
import { headers } from 'next/headers'

/**
 * @swagger
 */

export async function GET(req, { params: { projectId } }) {
  const headersList = headers()
  const userId = headersList.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createClient()
  try {
    const { data, error } = await supabase.rpc('get_project_by_id', {
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
  const supabase = createClient()
  try {
    const { data: project, error: updateError } = await supabase.rpc(
      'update_project_name',
      {
        project_id: projectId,
        new_name: name,
      }
    )

    if (updateError) {
      return Response.json({ error: updateError }, { status: 400 })
    }

    return Response.json(project, { status: 201 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
