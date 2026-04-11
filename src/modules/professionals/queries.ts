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
