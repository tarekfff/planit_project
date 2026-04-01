import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Update the session in case it has expired, using our helper
  const supabaseResponse = await updateSession(request);
  
  // Basic route protection logic will go here
  // Depending on the role, you logic redirects users who shouldn't access certain dashboards.
  // const user = await supabase.auth.getUser()
  // if (!user && request.nextUrl.pathname.startsWith('/manager')) {...}

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
