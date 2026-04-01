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
    .single();

  if (error) return null;
  return data;
}
