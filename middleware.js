import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { checkTokenExistsInDatabase } from './checkToken'

const COM_CHECK_APP = process.env.COM_CHECK_APP

export async function middleware(req) {
  // We need to create a response and hand it to the supabase client to be able to modify the response headers.
  const res = NextResponse.next()
  // Create authenticated Supabase Client.
  const supabase = createMiddlewareClient({ req, res })
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check auth condition
  if (session) {
    // Authentication successful, forward request to protected route.
    return res
  }

  // Auth condition not met, redirect to home page.
  const redirectUrl = req.nextUrl.clone()
  redirectUrl.pathname = '/login'
  redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: '/projects/:path*',
}

export const checkComCheckAppMiddleware = async (req, res, next) => {
  try {
    if (!COM_CHECK_APP) {
      const tokenResult = await checkTokenExistsInDatabase(req)
      console.log('API GOOD')

      if (!tokenResult) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
    }
    console.log('GOOD')
    next()
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
