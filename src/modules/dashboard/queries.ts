'use server';

import { createClient } from '@/lib/supabase/server';

export async function getSidebarData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, establishment: null, profile: null };

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    let establishment = null;
    if (profile?.role === 'manager' || profile?.role === 'admin') {
        const { data: est } = await supabase
            .from('establishments')
            .select('name, description, logo_url')
            .eq('manager_id', user.id)
            .single();
        establishment = est;
    }

    return { user, profile, establishment };
}

export async function getManagerDashboardData() {
    const supabase = await createClient();

    // 1. Get current logged in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 2. Get Establishment for this manager
    const { data: establishment } = await supabase
        .from('establishments')
        .select('*')
        .eq('manager_id', user.id)
        .single();

    if (!establishment) return null;

    // 3. Get Professionals for this establishment
    const { data: professionals } = await supabase
        .from('professionals')
        .select('id, full_name, avatar_url, working_hours')
        .eq('establishment_id', establishment.id)
        .eq('is_active', true);

    const proCount = professionals?.length || 0;

    // 4. Get Appointments for the establishment
    const { data: rawAppointments } = await supabase
        .from('appointments')
        .select(`
      id,
      start_time,
      end_time,
      status,
      client_notes,
      profiles!client_id (
        full_name
      ),
      professionals!professional_id (
        full_name
      ),
      services!service_id (
        name
      )
    `)
        .eq('establishment_id', establishment.id)
        .order('start_time', { ascending: false });

    // Fallbacks if data is missing
    const activeAppointments = rawAppointments || [];

    // Metrics Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Today's appointments
    const rdvToday = activeAppointments.filter((apt: any) => {
        const aptDate = new Date(apt.start_time);
        return aptDate >= today && aptDate <= endOfDay;
    }).length;

    // This Week's appointments
    const rdvWeek = activeAppointments.filter((apt: any) => {
        const aptDate = new Date(apt.start_time);
        return aptDate >= weekStart && aptDate <= weekEnd;
    }).length;

    const pendingCount = activeAppointments.filter((apt: any) => apt.status === 'pending').length;

    // Format appointments for the UI
    // Recent = today/upcoming
    // History = past
    const formattedAppointments = activeAppointments.map((apt: any) => {
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
        }
    });

    const recentAppointments = formattedAppointments
        .filter((a: any) => a.timestamp >= today.getTime()) // Today or future
        .slice(0, 5); // Just top 5

    const historyAppointments = formattedAppointments
        .filter((a: any) => a.timestamp < today.getTime()) // Past
        .slice(0, 5);

    return {
        establishment,
        metrics: {
            rdvToday,
            proCount,
            rdvWeek,
            satisfaction: 4.8, // Need real review system for this
            pendingCount
        },
        recentAppointments,
        historyAppointments
    };
}

export async function getEstablishmentProfileData() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: establishment } = await supabase
        .from('establishments')
        .select('*')
        .eq('manager_id', user.id)
        .single();

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

    return {
        user,
        establishment,
        professionals: professionals || [],
        services: services || [],
    };
}

