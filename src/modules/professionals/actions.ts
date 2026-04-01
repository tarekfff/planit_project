'use server';

import { createClient } from '@/lib/supabase/server';
import { ProfessionalInput, WorkingHoursInput, professionalSchema, workingHoursSchema } from './validators';

export async function createProfessional(data: ProfessionalInput) {
  const result = professionalSchema.safeParse(data);
  if (!result.success) return { error: 'Invalid input' };

  const supabase = await createClient();
  const { data: professional, error } = await supabase
    .from('professionals')
    .insert([result.data])
    .select();

  if (error) return { error: error.message };
  return { data: professional };
}

export async function updateWorkingHours(data: WorkingHoursInput) {
  const result = workingHoursSchema.safeParse(data);
  if (!result.success) return { error: 'Invalid input' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('working_hours')
    .upsert([result.data]);

  if (error) return { error: error.message };
  return { success: true };
}
