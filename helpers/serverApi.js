import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

const serverApi = async (req, res) => {
  // Create authenticated Supabase Client
  const supabase = createPagesServerClient({ req, res })
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw Error('The user does not have an active session or is not authenticated')
  }

  return supabase
}

export default serverApi
