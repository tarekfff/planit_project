import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect payload (e.g. ?next=/dashboard/admin)
  const next = searchParams.get('next') ?? ROUTES.dashboard.root

  if (code) {
    const supabase = await createClient()
    
    // Securely exchange the OAuth code injected by Google for an encrypted Session cookie natively
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Fallback to error route or login page if the code handshake was broken/expired
  return NextResponse.redirect(`${origin}${ROUTES.auth.login}?error=Could not authenticate user`)
}
