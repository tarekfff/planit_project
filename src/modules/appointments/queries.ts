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
    .select('id, working_hours')
    .eq('manager_id', user.id)
    .maybeSingle();

  if (!est) return { appointments: [], professionals: [], services: [], workingHours: [] };

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
    workingHours: est.working_hours || [],
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

export async function getProfessionalDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { metrics: { rdvToday: 0, rdvWeek: 0, activeServices: 0 }, appointments: [] };

  // Get professional profile
  const { data: prof } = await supabase
    .from('professionals')
    .select('id, establishment_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!prof) return { metrics: { rdvToday: 0, rdvWeek: 0, activeServices: 0 }, appointments: [] };

  // Fetch active services count for the professional or establishment
  const { count: activeServicesCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('establishment_id', prof.establishment_id)
    .eq('is_active', true);

  const { data: rawAppointments } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      status,
      profiles!appointments_client_id_fkey (full_name),
      professionals!professional_id (full_name),
      services!service_id (name)
    `)
    .eq('professional_id', prof.id)
    .neq('status', 'cancelled')
    .order('start_time', { ascending: true });

  const activeAppointments = rawAppointments || [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  let rdvToday = 0;
  let rdvWeek = 0;
  const todayAppointments: any[] = [];

  activeAppointments.forEach((apt: any) => {
    const aptDate = new Date(apt.start_time);
    
    // Check if within week
    if (aptDate >= weekStart && aptDate <= weekEnd) {
      rdvWeek++;
    }

    // Check if today
    if (aptDate >= today && aptDate <= endOfDay) {
      rdvToday++;
      
      const start = new Date(apt.start_time);
      const end = new Date(apt.end_time);
      todayAppointments.push({
        id: apt.id,
        time: `${start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}-${end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
        professional: apt.professionals?.full_name || 'Inconnu',
        client: apt.profiles?.full_name || 'Inconnu',
        service: apt.services?.name || 'Inconnu',
        status: apt.status as 'confirmed' | 'pending' | 'cancelled',
      });
    }
  });

  return {
    metrics: { 
      rdvToday, 
      rdvWeek, 
      activeServices: activeServicesCount || 0 
    },
    appointments: todayAppointments
  };
}

export async function getProfessionalAppointments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { appointments: [], professionals: [], services: [], workingHours: [] };

  // Get professional profile
  const { data: prof } = await supabase
    .from('professionals')
    .select('id, full_name, establishment_id, working_hours')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!prof) return { appointments: [], professionals: [], services: [], workingHours: [] };

  // Services available to this professional via junction table OR general (no assignments)
  // Step 1: Get service IDs assigned to ME
  const { data: myLinks } = await supabase
    .from('professional_services')
    .select('service_id')
    .eq('professional_id', prof.id);

  // Step 2: Get ALL service IDs that have ANY professional link (to identify general services)
  const { data: allLinks } = await supabase
    .from('professional_services')
    .select('service_id');

  const myServiceIds = new Set((myLinks || []).map(l => l.service_id));
  const assignedServiceIds = new Set((allLinks || []).map(l => l.service_id));

  // Step 3: Fetch all services for the establishment
  const { data: allServicesRaw } = await supabase
    .from('services')
    .select('id, name, duration_minutes')
    .eq('establishment_id', prof.establishment_id)
    .eq('is_active', true)
    .order('name');

  // Step 4: Filter: my services OR services with no assignments (general)
  const services = (allServicesRaw || []).filter(s =>
    myServiceIds.has(s.id) || !assignedServiceIds.has(s.id)
  );

  const validServiceIds = services.map(s => s.id);

  // Use admin client to bypass RLS for reading ALL appointments in the establishment
  // (RLS would otherwise block seeing other professionals' appointments)
  let allAppointments: any[] = [];
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createClient: createRawClient } = await import('@supabase/supabase-js');
    const adminSupabase = createRawClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data } = await adminSupabase
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
      .eq('establishment_id', prof.establishment_id)
      .neq('status', 'cancelled')
      .order('start_time', { ascending: true });
    allAppointments = data || [];
  } else {
    // Fallback: user-scoped client (may be limited by RLS)
    const { data } = await supabase
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
      .eq('establishment_id', prof.establishment_id)
      .neq('status', 'cancelled')
      .order('start_time', { ascending: true });
    allAppointments = data || [];
  }

  // Filter: my own appointments OR appointments using a service I also handle
  const appointments = allAppointments.filter(apt => {
    if (apt.professional_id === prof.id) return true;
    if (apt.service_id && validServiceIds.includes(apt.service_id)) return true;
    return false;
  });

  return {
    appointments: appointments,
    professionals: [{ id: prof.id, full_name: prof.full_name }],
    services: services || [],
    establishmentId: prof.establishment_id,
    workingHours: prof.working_hours || [],
    currentProfessionalId: prof.id,
  };
}

