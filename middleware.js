import { NextResponse } from 'next/server'

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { supabaseService } from './helpers/supabaseService'

export async function middleware(req) {
  const requestHeaders = new Headers(req.headers)

  if (
    req.nextUrl.pathname.startsWith('/projects') ||
    req.nextUrl.pathname.startsWith('/tokens')
  ) {
    // Create authenticated Supabase Client.
    const supabase = createMiddlewareClient({ req, res: NextResponse.next() })
    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Check auth condition
    if (session) {
      // Authentication successful, forward request to protected route.
      return NextResponse.next()
    }

    // Auth condition not met, redirect to home page.
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }
  // Доступ к API у нас в двух случаях. Или это аутентифицированный пользователь, или же в заголовке запроса есть токен. Проверим, и в зависимости от этого вернем ответ. Или ошибку доступа, или запрос, в который добавим айди пользователя.
  if (req.nextUrl.pathname.startsWith('/api/projects')) {
    let access_token
    try {
      access_token = req.headers.get('x-comcheck-token')
      if (!access_token) {
        const supabase = createMiddlewareClient({ req, res: NextResponse.next() })
        const user = await supabase.auth.getUser()
        if (!user) {
          return NextResponse.status(401).json({ error: 'Unauthorized' })
        }
        requestHeaders.set('x-user-id', user?.data?.user?.id)
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }
    } catch (error) {
      return Response.json(
        { success: false, message: 'authentication failed' },
        { status: 401 }
      )
    }
    try {
      const tokenResult = await supabaseService
        .from('tokens')
        .select('user_id')
        .eq('id', access_token)

      if (!tokenResult || !tokenResult.data.length) {
        return Response.json(
          { success: false, message: 'authentication failed' },
          { status: 401 }
        )
      }
      requestHeaders.set('x-user-id', tokenResult.data[0].user_id)
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      return Response.json(
        { success: false, message: 'Internal Server Error' },
        { status: 500 }
      )
    }
  }
}

export const config = {
  matcher: ['/projects/:path*', '/tokens', '/api/:path*'],
}
