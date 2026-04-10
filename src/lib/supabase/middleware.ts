import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

/**
 * Creates a Supabase client for use in Next.js middleware.
 *
 * KEY DESIGN: Uses getAll/setAll (not get/set/remove) to ensure atomic cookie
 * updates. When Supabase refreshes a token, setAll is called ONCE with all
 * updated cookies, and we rebuild the response to carry them forward. This
 * prevents the "refresh_token_already_used" error caused by partial cookie
 * writes or stale response references.
 */
export function createClient(request: NextRequest) {
  // Start with a fresh response that forwards the original request headers.
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Update the request cookies so downstream server components
          //    reading cookies() see the fresh tokens.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          // 2. Rebuild the response with the mutated request so the
          //    refreshed cookies are forwarded to the browser.
          response = NextResponse.next({ request })

          // 3. Set every cookie on the response with the proper options
          //    (httpOnly, secure, sameSite, path, maxAge, etc.)
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  return { supabase, response: () => response }
}
