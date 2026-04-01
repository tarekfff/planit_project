'use server';

import { createClient } from '@/lib/supabase/server';
import { EstablishmentInput, establishmentSchema } from './validators';

export async function createEstablishment(data: EstablishmentInput) {
  const result = establishmentSchema.safeParse(data);
  if (!result.success) return { error: 'Invalid input' };

  const supabase = await createClient();
  const { data: establishment, error } = await supabase
    .from('establishments')
    .insert([result.data])
    .select();

  if (error) return { error: error.message };
  return { data: establishment };
}

export async function updateEstablishment(id: string, data: Partial<EstablishmentInput>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('establishments')
    .update(data)
    .eq('id', id);

  if (error) return { error: error.message };
  return { success: true };
}
