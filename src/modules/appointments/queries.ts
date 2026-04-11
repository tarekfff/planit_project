import 'server-only';
import { createClient } from '@/lib/supabase/server';

/**
 * Fetch all appointments for the manager's establishment.
 * Joins professional name + service name for calendar display.
 */
export async function getManagerAppointments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { appointments: [], professionals: [], services: [] };

  // Get manager's establishment
  const { data: est } = await supabase
    .from('establishments')
    .select('id')
    .eq('manager_id', user.id)
    .maybeSingle();

  if (!est) return { appointments: [], professionals: [], services: [] };

  // Appointments with joins
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      status,
      client_notes,
      internal_notes,
      client_id,
      professional_id,
      service_id,
      professionals ( id, full_name ),
      services ( id, name )
    `)
    .eq('establishment_id', est.id)
    .neq('status', 'cancelled')
    .order('start_time', { ascending: true });

  // Active professionals for the dropdown
  const { data: professionals } = await supabase
    .from('professionals')
    .select('id, full_name')
    .eq('establishment_id', est.id)
    .eq('is_active', true)
    .order('full_name');

  // Active services for the dropdown
  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_minutes')
    .eq('establishment_id', est.id)
    .eq('is_active', true)
    .order('name');

  return {
    appointments: appointments || [],
    professionals: professionals || [],
    services: services || [],
    establishmentId: est.id,
  };
}

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

export async function getManagerDashboardAppointments(establishmentId: string) {
  const supabase = await createClient();

  const { data: rawAppointments } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      status,
      client_notes,
      profiles!appointments_client_id_fkey (full_name),
      professionals!professional_id (full_name),
      services!service_id (name)
    `)
    .eq('establishment_id', establishmentId)
    .order('start_time', { ascending: false });

  const activeAppointments = rawAppointments || [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const rdvToday = activeAppointments.filter((apt: any) => {
    const aptDate = new Date(apt.start_time);
    return aptDate >= today && aptDate <= endOfDay;
  }).length;

  const rdvWeek = activeAppointments.filter((apt: any) => {
    const aptDate = new Date(apt.start_time);
    return aptDate >= weekStart && aptDate <= weekEnd;
  }).length;

  const pendingCount = activeAppointments.filter((apt: any) => apt.status === 'pending').length;

  const formatted = activeAppointments.map((apt: any) => {
    const start = new Date(apt.start_time);
    const end = new Date(apt.end_time);
    return {
      id: apt.id,
      date: start.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      time: `${start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}-${end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
      professional: apt.professionals?.full_name || 'Inconnu',
      client: apt.profiles?.full_name || 'Inconnu',
      service: apt.services?.name || 'Service supprimé',
      status: apt.status as 'confirmed' | 'pending' | 'cancelled',
      timestamp: start.getTime(),
    };
  });

  // Calculate daily activity for the bar chart
  const weekDays = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
  const dailyActivity = weekDays.map((label, index) => {
    // Determine the date for each day of the current week window
    const dayApts = activeAppointments.filter((apt: any) => {
        const d = new Date(apt.start_time);
        return d.getDay() === index && d >= weekStart && d <= weekEnd;
    }).length;
    
    return { day: label, val: dayApts };
  });

  // Normalize for chart (percentage of max in week)
  const maxVal = Math.max(...dailyActivity.map(d => d.val), 1);
  const normalizedActivity = dailyActivity.map(d => ({
    ...d,
    val: Math.round((d.val / maxVal) * 100)
  }));

  return {
    metrics: { rdvToday, rdvWeek, pendingCount },
    recent: formatted.filter(a => a.timestamp >= today.getTime()).slice(0, 5),
    history: formatted.filter(a => a.timestamp < today.getTime()).slice(0, 5),
    dailyActivity: normalizedActivity,
    pendingItems: activeAppointments
      .filter(apt => apt.status === 'pending')
      .map(apt => ({
        id: apt.id,
        pro: apt.professionals?.full_name || 'Inconnu',
        service: apt.services?.name || 'Inconnu',
        time: new Date(apt.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }))
  };
}
