import { createClient } from '@/lib/supabase/server'

export async function getAppointmentsForClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('appointments')
    .select(`
      id, start_time, end_time, status, client_notes,
      service:services(name, price, duration_minutes),
      professional:professionals(full_name, avatar_url),
      establishment:establishments(name, address, wilaya)
    `)
    .eq('client_id', user.id)
    .order('start_time', { ascending: true })

  return data ?? []
}

export async function getScheduleForEstablishment(establishmentId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('appointments')
    .select(`
      id, start_time, end_time, status, internal_notes,
      client:profiles!client_id(full_name, phone),
      professional:professionals(full_name),
      service:services(name, duration_minutes)
    `)
    .eq('establishment_id', establishmentId)
    .neq('status', 'cancelled')
    .order('start_time', { ascending: true })

  return data ?? []
}
