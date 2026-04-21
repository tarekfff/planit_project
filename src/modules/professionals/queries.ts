import 'server-only';
import { createClient } from '@/lib/supabase/server';

export async function getProfessionalsByEstablishment(establishmentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('professionals')
    .select('*, user:profiles(*)')
    .eq('establishment_id', establishmentId);

  if (error) return [];
  return data;
}

export async function getProfessional(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('professionals')
    .select('*, working_hours(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function getProfessionalServicesSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: prof } = await supabase
    .from('professionals')
    .select('id, full_name, establishment_id, working_hours')
    .eq('user_id', user.id)
    .single();

  if (!prof) return null;

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('professional_id', prof.id)
    .order('name');

  return { professional: prof, services: services || [] };
}
