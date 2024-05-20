import { supabaseService } from '@/app/supabase/service'

export function GET(req, { params: { checkId } }) {
  if (!checkId) {
    return new Response(JSON.stringify({ error: 'Missing checkId parameter' }), {
      status: 400,
    })
  }

  return supabaseService
    .from('checks')
    .select('id, content')
    .eq('id', checkId)
    .then(({ data, error }) => {
      if (error) {
        throw error
      }
      return new Response(JSON.stringify(data[0]), { status: 200 })
    })
    .catch((error) => {
      return new Response(JSON.stringify({ error: error.message || error }), {
        status: 500,
      })
    })
}
