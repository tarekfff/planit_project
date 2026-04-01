'use server';

import { createClient } from '@/lib/supabase/server';
import { AppointmentInput, appointmentSchema } from './validators';

export async function bookAppointment(data: AppointmentInput) {
  const result = appointmentSchema.safeParse(data);
  if (!result.success) return { error: 'Invalid input' };

  const supabase = await createClient();
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert([result.data])
    .select();

  if (error) return { error: error.message };
  return { data: appointment };
}

export async function cancelAppointment(appointmentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId);

  if (error) return { error: error.message };
  return { success: true };
}
