import 'server-only';
import { createClient } from '@/lib/supabase/server';

export async function getAppointmentsForClient(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*, professional:professionals(*), establishment:establishments(*)')
    .eq('client_id', clientId)
    .order('start_time', { ascending: false });

  if (error) return [];
  return data;
}

export async function getScheduleForPro(professionalId: string, startDate: string, endDate: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('professional_id', professionalId)
    .gte('start_time', startDate)
    .lte('end_time', endDate)
    .order('start_time', { ascending: true });

  if (error) return [];
  return data;
}
