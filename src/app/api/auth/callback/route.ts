import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? ROUTES.dashboard.root

  if (code) {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // After OAuth, ensure establishment exists for managers
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.user_metadata?.role === 'manager') {
          const estName = user.user_metadata?.establishment_name || user.user_metadata?.full_name || 'Mon Établissement'
          await supabase.rpc('create_manager_establishment', {
            p_name: estName,
            p_wilaya: user.user_metadata?.wilaya || 'Non défini',
            p_phone: user.user_metadata?.phone || '',
            p_description: user.user_metadata?.category || '',
          })
        }
      } catch (e) {
        console.error('Establishment RPC in callback failed:', e)
      }

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

  return NextResponse.redirect(`${origin}${ROUTES.auth.login}?error=Could not authenticate user`)
}
