import { supabaseService } from '@/app/supabase/server'

export async function POST(req) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 })
  }

  try {
    console.log({ email, password })
    const { data, error } = await supabaseService.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return Response.json({ data }, { status: 200 })
  } catch (error) {
    return Response.json({ error }, { status: error.status })
  }
}
