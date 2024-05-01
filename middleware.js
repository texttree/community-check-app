import { NextResponse } from 'next/server'

import acceptLanguage from 'accept-language'

import { supabaseMiddleware } from '@/app/supabase/middleware'
import { fallbackLng, languages, cookieName } from '@/app/i18n/settings'
import { createClient } from './app/supabase/service'
import { Cookies } from 'react-cookie'

acceptLanguage.languages(languages)

export async function middleware(req) {
  const requestHeaders = new Headers(req.headers)
  let lng
  if (req.cookies.has(cookieName)) {
    lng = acceptLanguage.get(req.cookies.get(cookieName).value)
  }
  if (!lng) {
    lng = acceptLanguage.get(req.headers.get('Accept-Language'))
  }
  if (!lng) {
    lng = fallbackLng
  }

  if (
    // !['.png', '.jpg', '.ico', '.svg'].includes(req.nextUrl.pathname.slice(-4)) &&
    !req.nextUrl.pathname.startsWith('/api') &&
    !req.nextUrl.pathname.startsWith('/doc')
  ) {
    if (
      !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
      !req.nextUrl.pathname.startsWith('/_next')
    ) {
      return NextResponse.redirect(new URL(`/${lng}${req.nextUrl.pathname}`, req.url))
    }

    if (req.headers.has('referer')) {
      const refererUrl = new URL(req.headers.get('referer'))
      const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`))
      const response = NextResponse.next()
      if (lngInReferer) {
        response.cookies.set(cookieName, lngInReferer)
      }
      return response
    }
  }

  if (
    !req.nextUrl.pathname.startsWith('/api') &&
    (req.nextUrl.pathname.split('/')?.[2] === 'projects' ||
      req.nextUrl.pathname.split('/')?.[2] === 'tokens')
  ) {
    const { supabase, response } = supabaseMiddleware(req)
    let data, error
    try {
      const userResult = await supabase.auth.getUser()
      data = userResult.data
      error = userResult.error
      if (error) {
        throw error
      }
      if (!data?.user) {
        throw Error('Middleware error: Unauthorized user')
      }
    } catch (error) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/' + lng + '/login'
      redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    return response
  }

  // Доступ к API у нас в двух случаях. Или это аутентифицированный пользователь, или же в заголовке запроса есть токен. Проверим, и в зависимости от этого вернем ответ. Или ошибку доступа, или запрос, в который добавим айди пользователя.
  if (
    req.nextUrl.pathname.startsWith('/api') &&
    !req.nextUrl.pathname.startsWith('/api/register')
  ) {
    let access_token
    try {
      access_token = req.headers.get('x-comcheck-token')
      if (!access_token) {
        const { supabase, response } = supabaseMiddleware(req)
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          return NextResponse.status(401).json({
            error: 'Middleware unauthorized: unknown error',
          })
        }

        if (!data?.user) {
          return NextResponse.status(401).json({
            error: 'Middleware unauthorized: unknown user',
          })
        }

        const headers = new Headers(response.headers)
        headers.set('x-user-id', data.user?.id)
        return NextResponse.next({
          request: {
            headers,
            cookies: new Cookies(response.cookies),
          },
        })
        // response.headers.set('x-user-id', data.user?.id)

        // return response
      }
    } catch (error) {
      return Response.json(
        { success: false, error, message: 'Password authentication failed' },
        { status: 401 }
      )
    }
    try {
      const supabaseService = createClient()
      const tokenResult = await supabaseService
        .from('tokens')
        .select('user_id')
        .eq('id', access_token)

      if (!tokenResult || !tokenResult.data.length) {
        return Response.json(
          { success: false, message: 'Token authentication failed' },
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
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|doc|_next/image|favicon.ico|icon[1,2,3,4].png|swagger.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    //    '/((?!_next/static|_next/image).*)(\\.(?!png|jpg|svg|ico))?',
    //    '/api/:path*',
    //    '/(ru|en)(\\/.*)(\\.(?!png|jpg|svg|ico))?',
  ],
}
