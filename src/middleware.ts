import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'
import { ROUTES } from '@/lib/constants/routes'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Not logged in → redirect to login (Skipping Server Actions to avoid 'unexpected response' client errors)
  const isServerAction = request.headers.has('next-action');

  if (!user && path.startsWith('/dashboard')) {
    if (isServerAction) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(ROUTES.auth.login, request.url))
  }

  // Logged in → redirect away from auth pages
  if (user && (path === ROUTES.auth.login || path === ROUTES.auth.register)) {
    return NextResponse.redirect(new URL(ROUTES.dashboard.root, request.url))
  }

  // Role-based access: get the role from the profile
  if (user && path.startsWith('/dashboard')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    if (path.startsWith('/dashboard/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (path.startsWith('/dashboard/manager') && !['manager', 'admin'].includes(role ?? '')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (path.startsWith('/dashboard/professional') && !['professional', 'manager', 'admin'].includes(role ?? '')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
