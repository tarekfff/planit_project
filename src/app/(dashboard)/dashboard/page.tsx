import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"

export default async function DashboardRoutingHub() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Middleware caught them, but just in case
  if (!user) {
    redirect('/login')
  }

  // Securely request the user's role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Fallback to client routing if the profile failed to load or role is missing
  const role = profile?.role || 'client'

  if (role === 'client') {
    redirect('/client')
  } else {
    // Execute dynamic bounce
    redirect(`/dashboard/${role}`)
  }
}
