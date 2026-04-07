import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'
import { ROUTES } from '@/lib/constants/routes'

/** Copy refreshed Supabase session cookies from `response` onto a redirect response. */
function redirectWithCookies(url: URL, response: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url)
  response.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie.name, cookie.value, cookie as Parameters<typeof redirect.cookies.set>[2])
  })
  return redirect
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Not logged in → redirect to login (Skipping Server Actions to avoid 'unexpected response' client errors)
  const isServerAction = request.headers.has('next-action')

  if (!user && path.startsWith('/dashboard')) {
    if (isServerAction) {
      return NextResponse.next()
    }
    return redirectWithCookies(new URL(ROUTES.auth.login, request.url), response)
  }

  // Logged in → redirect away from auth pages
  if (user && (path === ROUTES.auth.login || path === ROUTES.auth.register)) {
    return redirectWithCookies(new URL(ROUTES.dashboard.root, request.url), response)
  }

  // Role-based access: only enforce if we successfully retrieved a role
  if (user && path.startsWith('/dashboard')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // Only redirect if we have a confirmed role that doesn't match — never redirect on a null role
    if (role) {
      if (path.startsWith('/dashboard/admin') && role !== 'admin') {
        return redirectWithCookies(new URL('/dashboard', request.url), response)
      }
      if (path.startsWith('/dashboard/manager') && !['manager', 'admin'].includes(role)) {
        return redirectWithCookies(new URL('/dashboard', request.url), response)
      }
      if (path.startsWith('/dashboard/professional') && !['professional', 'manager', 'admin'].includes(role)) {
        return redirectWithCookies(new URL('/dashboard', request.url), response)
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
