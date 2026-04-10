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
      profiles!client_id (full_name),
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
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + (index === 0 ? 6 : index - 1)); // Adjust for Monday start if needed
    // Actually simpler:
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
