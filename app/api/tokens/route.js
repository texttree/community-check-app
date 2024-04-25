import { createClient } from '@/app/supabase/service'

export async function GET(req) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabaseService = createClient()
  try {
    const { data: tokens, error } = await supabaseService
      .from('tokens')
      .select('name, created_at')
      .eq('user_id', userId)
    if (error) throw error
    return Response.json(tokens, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
export async function POST(req) {
  const userId = req.headers.get('x-user-id')
  const { tokenName } = await req.json()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!tokenName) {
    return Response.json({ error: 'Token name is required' }, { status: 400 })
  }
  const supabaseService = createClient()
  // try {
  const { data: tokens, error: tokenError } = await supabaseService
    .from('tokens')
    .select()
    .eq('name', tokenName)
    .eq('user_id', userId)
  if (tokenError) {
    throw tokenError
  }
  console.log({ tokens, tokenError })
  if (tokens.length > 0) {
    throw new Error('Token already exists')
  }
  const { data, error } = await supabaseService
    .from('tokens')
    .insert({ name: tokenName, user_id: userId })
    .select()
  console.log({ data, error })
  if (error) {
    throw error
  }
  return Response.json(data[0].id, { status: 200 })
  // } catch (error) {
  //   return Response.json({ error }, { status: 500 })
  // }
}
export async function DELETE(req) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabaseService = createClient()
  try {
    const { error } = await supabaseService
      .from('tokens')
      .delete()
      .match({ name: tokenName, user_id: userId })
    if (error) {
      throw error
    }
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
