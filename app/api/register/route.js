import { createClient } from '@/app/supabase/server'

export async function POST(req) {
  const supabaseServer = createClient()

  const { email, password } = await req.json()
  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseServer.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return Response.json({ data }, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: error.status })
  }
}
