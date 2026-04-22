import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'
import { ROUTES } from '@/lib/constants/routes'

/**
 * Copy all Supabase session cookies from the middleware response onto a redirect.
 * Without this, a redirect would drop the refreshed tokens and the browser
 * would still hold the old (now invalid) refresh token.
 */
function redirectWithCookies(url: URL, sourceResponse: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url)
  sourceResponse.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(
      cookie.name,
      cookie.value,
      cookie as Parameters<typeof redirect.cookies.set>[2]
    )
  })
  return redirect
}

export async function middleware(request: NextRequest) {
  const { supabase, response: getResponse } = createClient(request)

  // ── 1. Single auth check (this is the ONLY place tokens get refreshed) ──
  // getUser() contacts Supabase to verify the JWT and triggers a token refresh
  // if the access token is expired. After this call, setAll has already been
  // called if a refresh happened, so `getResponse()` returns the updated response.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // ── 2. Handle token-reuse errors defensively ──
  // If the refresh token was already consumed (e.g., by a parallel request),
  // the session is irrecoverably invalid. Clear cookies and redirect to login
  // instead of crashing or entering an infinite redirect loop.
  if (userError?.code === 'session_not_found' || userError?.code === 'refresh_token_not_found') {
    // Session is gone — let the user re-authenticate.
    // We don't redirect here for public pages, only for protected routes.
    if (path.startsWith('/dashboard') || path.startsWith('/client') || path.startsWith('/search')) {
      const loginUrl = new URL(ROUTES.auth.login, request.url)
      loginUrl.searchParams.set('reason', 'session_expired')
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── 3. Protect dashboard routes ──
  const isServerAction = request.headers.has('next-action')

  if (!user && (path.startsWith('/dashboard') || path.startsWith('/client') || path.startsWith('/search'))) {
    // Skip redirecting server actions — they're AJAX and a redirect causes
    // "Unexpected response" errors on the client.
    if (isServerAction) {
      return getResponse()
    }
    return redirectWithCookies(new URL(ROUTES.auth.login, request.url), getResponse())
  }

  // ── 4. Redirect authenticated users away from auth pages ──
  if (user && (path === ROUTES.auth.login || path === ROUTES.auth.register)) {
    return redirectWithCookies(new URL(ROUTES.dashboard.root, request.url), getResponse())
  }

  // ── 5. Role-based access control ──
  // Only runs when we have a confirmed user AND we're inside protected routes.
  // Reuses the SAME Supabase client (no second token refresh).
  if (user && (path.startsWith('/dashboard') || path.startsWith('/client') || path.startsWith('/search'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // Only redirect when we have a confirmed role that doesn't match.
    // A null role (e.g., profile not yet created) is allowed through
    // to prevent redirect loops for brand-new users.
    if (role) {
      if (path.startsWith('/dashboard/admin') && role !== 'admin') {
        return redirectWithCookies(new URL('/dashboard', request.url), getResponse())
      }
      if (path.startsWith('/dashboard/manager') && !['manager', 'admin'].includes(role)) {
        return redirectWithCookies(new URL('/dashboard', request.url), getResponse())
      }
      if (
        path.startsWith('/dashboard/professional') &&
        !['professional', 'manager', 'admin'].includes(role)
      ) {
        return redirectWithCookies(new URL('/dashboard', request.url), getResponse())
      }
      if (path.startsWith('/client') && role !== 'client') {
        return redirectWithCookies(new URL('/dashboard', request.url), getResponse())
      }
    }
  }

  // ── 6. Return the (possibly cookie-updated) response ──
  return getResponse()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (browser icon)
     * - Public assets (images, SVGs, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
