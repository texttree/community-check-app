import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })

  const {
    body: { email, password },
    method,
  } = req

  switch (method) {
    case 'POST': // создать новый проект
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        return res.status(200).json({ data })
      } catch (error) {
        return res.status(error.status).json({ error })
      }

    default:
      res.setHeader('Allow', ['POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
