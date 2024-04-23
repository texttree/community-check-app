import { NextResponse } from 'next/server'

// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
// import { supabaseService } from './helpers/supabaseService'

import acceptLanguage from 'accept-language'
import { fallbackLng, languages, cookieName } from './app/i18n/settings'

acceptLanguage.languages(languages)

export async function middleware(req) {
  // const requestHeaders = new Headers(req.headers)
  let lng
  if (req.cookies.has(cookieName))
    lng = acceptLanguage.get(req.cookies.get(cookieName).value)
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'))
  if (!lng) lng = fallbackLng
  console.log('18', req.nextUrl.pathname)
  if (
    !['.png', '.jpg', '.ico', '.svg'].includes(req.nextUrl.pathname.slice(-4)) &&
    !req.nextUrl.pathname.startsWith('/api')
  ) {
    if (
      !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
      !req.nextUrl.pathname.startsWith('/_next')
    ) {
      console.log('23', req.nextUrl.pathname)
      return NextResponse.redirect(new URL(`/${lng}${req.nextUrl.pathname}`, req.url))
    }

    if (req.headers.has('referer')) {
      const refererUrl = new URL(req.headers.get('referer'))
      const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`))
      const response = NextResponse.next()
      if (lngInReferer) response.cookies.set(cookieName, lngInReferer)
      return response
    }
  }
  return NextResponse.next()
  // if (
  //   req.nextUrl.pathname.startsWith('/projects') ||
  //   req.nextUrl.pathname.startsWith('/tokens')
  // ) {
  //   // Create authenticated Supabase Client.
  //   const supabase = createMiddlewareClient({ req, res: response })
  //   // Check if we have a session
  //   const {
  //     data: { session },
  //   } = await supabase.auth.getSession()

  //   // Check auth condition
  //   if (session) {
  //     // Authentication successful, forward request to protected route.
  //     return response
  //   }

  //   // Auth condition not met, redirect to home page.
  //   const redirectUrl = req.nextUrl.clone()
  //   redirectUrl.pathname = '/' + lng + '/login'
  //   redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
  //   return NextResponse.redirect(redirectUrl)
  // }
  // Доступ к API у нас в двух случаях. Или это аутентифицированный пользователь, или же в заголовке запроса есть токен. Проверим, и в зависимости от этого вернем ответ. Или ошибку доступа, или запрос, в который добавим айди пользователя.
  // if (req.nextUrl.pathname.startsWith('/api/projects')) {
  //   let access_token
  //   try {
  //     access_token = req.headers.get('x-comcheck-token')
  //     if (!access_token) {
  //       const supabase = createMiddlewareClient({ req, res: NextResponse.next() })
  //       const user = await supabase.auth.getUser()
  //       if (!user) {
  //         return NextResponse.status(401).json({ error: 'Unauthorized' })
  //       }
  //       requestHeaders.set('x-user-id', user?.data?.user?.id)
  //       return NextResponse.next({
  //         request: {
  //           headers: requestHeaders,
  //         },
  //       })
  //     }
  //   } catch (error) {
  //     return Response.json(
  //       { success: false, message: 'authentication failed' },
  //       { status: 401 }
  //     )
  //   }
  //   try {
  //     const tokenResult = await supabaseService
  //       .from('tokens')
  //       .select('user_id')
  //       .eq('id', access_token)

  //     if (!tokenResult || !tokenResult.data.length) {
  //       return Response.json(
  //         { success: false, message: 'authentication failed' },
  //         { status: 401 }
  //       )
  //     }
  //     requestHeaders.set('x-user-id', tokenResult.data[0].user_id)
  //     return NextResponse.next({
  //       request: {
  //         headers: requestHeaders,
  //       },
  //     })
  //   } catch (error) {
  //     return Response.json(
  //       { success: false, message: 'Internal Server Error' },
  //       { status: 500 }
  //     )
  //   }
  // }
  // return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image).*)(\\.(?!png|jpg|svg|ico))?',
    '/api/:path*',
    '/(ru|en)(\\/.*)(\\.(?!png|jpg|svg|ico))?',
  ],
}
