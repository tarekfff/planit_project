import 'server-only';
import { createClient } from '@/lib/supabase/server';

export async function getEstablishmentsByWilaya(wilaya: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('establishments')
    .select('*')
    .eq('wilaya', wilaya);

  if (error) return [];
  return data;
}

export async function getById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('establishments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function getEstablishmentForManager(managerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('establishments')
    .select('*')
    .eq('manager_id', managerId)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function getDashboardStats(establishmentId: string) {
  const supabase = await createClient();

  const { count: proCount } = await supabase
    .from('professionals')
    .select('*', { count: 'exact', head: true })
    .eq('establishment_id', establishmentId)
    .eq('is_active', true);

  // For satisfaction, we'll mock it at 4.8 until a reviews system is in place
  return {
    proCount: proCount || 0,
    satisfaction: 4.8,
  };
}

export async function getServiceTrends(establishmentId: string) {
  const supabase = await createClient();

  // Fetch all services for the establishment
  const { data: services } = await supabase
    .from('services')
    .select('id, name')
    .eq('establishment_id', establishmentId);

  if (!services) return [];

  // Fetch appointment counts per service (ideally this would be a single optimized query or a view)
  const { data: appointmentCounts } = await supabase
    .from('appointments')
    .select('service_id')
    .eq('establishment_id', establishmentId);

  const counts: Record<string, number> = {};
  appointmentCounts?.forEach(apt => {
    if (apt.service_id) {
      counts[apt.service_id] = (counts[apt.service_id] || 0) + 1;
    }
  });

  const total = appointmentCounts?.length || 1;

  return services
    .map(s => ({
      label: s.name,
      percent: Math.round(((counts[s.id] || 0) / total) * 100),
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 4);
}

export async function getOccupancyRates(establishmentId: string) {
  const supabase = await createClient();

  const { data: professionals } = await supabase
    .from('professionals')
    .select('id, full_name')
    .eq('establishment_id', establishmentId)
    .eq('is_active', true);

  if (!professionals) return [];

  // Mocking occupancy for now as it requires complex join with working_hours and appointments
  // In a real scenario, we'd calculate booked_minutes / available_minutes
  return professionals.map(p => ({
    label: p.full_name,
    percent: Math.floor(Math.random() * 60) + 20, // 20-80% random for demo
    color: 'bg-purple-500'
  })).slice(0, 3);
}

export async function getSidebarData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, establishment: null, profile: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  let establishment = null;
  if (profile?.role === 'manager' || profile?.role === 'admin') {
    const { data: est } = await supabase
      .from('establishments')
      .select('name, description, logo_url')
      .eq('manager_id', user.id)
      .maybeSingle();
    establishment = est;
  }

  return { user, profile, establishment };
}

export async function getEstablishmentProfileData() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: establishment } = await supabase
    .from('establishments')
    .select('*')
    .eq('manager_id', user.id)
    .maybeSingle();

  if (!establishment) return null;

  // Fetch related professionals
  const { data: professionals } = await supabase
    .from('professionals')
    .select('*')
    .eq('establishment_id', establishment.id)
    .eq('is_active', true);

  // Fetch related services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('establishment_id', establishment.id);

  // Fetch all professional<->service links for this establishment
  const { data: professionalServices } = await supabase
    .from('professional_services')
    .select('professional_id, service_id');

  return {
    user,
    establishment,
    professionals: professionals || [],
    services: services || [],
    professionalServices: professionalServices || [],
  };
}
