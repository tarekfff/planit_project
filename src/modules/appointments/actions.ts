'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const appointmentSchema = z.object({
  professional_id: z.string().uuid('Sélectionnez un professionnel'),
  service_id: z.string().uuid('Sélectionnez un service').optional().or(z.literal('')),
  client_name: z.string().min(2, 'Le nom du client est requis'),
  start_time: z.string().min(1, 'Date de début requise'),
  end_time: z.string().min(1, 'Date de fin requise'),
  client_notes: z.string().optional(),
  internal_notes: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).default('confirmed'),
});

/**
 * Create a new appointment from the manager's calendar
 */
export async function createAppointment(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  const raw = Object.fromEntries(formData);
  const parsed = appointmentSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    // Get establishment
    const { data: est } = await supabase
      .from('establishments')
      .select('id')
      .eq('manager_id', user.id)
      .maybeSingle();

    if (!est) throw new Error('Établissement introuvable');

    // Find or create a "walk-in" client profile for manager-created appointments
    // For now, use the manager's own ID as client_id (the manager books on behalf)
    // In production, you'd have a proper client lookup/creation flow
    const clientId = user.id;

    const { error } = await supabase
      .from('appointments')
      .insert({
        establishment_id: est.id,
        professional_id: parsed.data.professional_id,
        service_id: parsed.data.service_id || null,
        client_id: clientId,
        start_time: parsed.data.start_time,
        end_time: parsed.data.end_time,
        status: parsed.data.status,
        client_notes: parsed.data.client_notes || null,
        internal_notes: parsed.data.internal_notes || null,
      });

    if (error) {
      if (error.message.includes('double_booking')) {
        return { success: false, error: 'Ce créneau est déjà réservé pour ce professionnel.' };
      }
      throw error;
    }

    revalidatePath('/dashboard/manager/calendar');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Update an existing appointment (time, professional, notes, status)
 */
export async function updateAppointment(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  const id = formData.get('id') as string;
  if (!id) return { success: false, error: 'ID manquant' };

  const raw = Object.fromEntries(formData);
  const parsed = appointmentSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const { data: est } = await supabase
      .from('establishments')
      .select('id')
      .eq('manager_id', user.id)
      .maybeSingle();

    if (!est) throw new Error('Établissement introuvable');

    const { error } = await supabase
      .from('appointments')
      .update({
        professional_id: parsed.data.professional_id,
        service_id: parsed.data.service_id || null,
        start_time: parsed.data.start_time,
        end_time: parsed.data.end_time,
        status: parsed.data.status,
        client_notes: parsed.data.client_notes || null,
        internal_notes: parsed.data.internal_notes || null,
      })
      .eq('id', id)
      .eq('establishment_id', est.id);

    if (error) {
      if (error.message.includes('double_booking')) {
        return { success: false, error: 'Ce créneau est déjà réservé pour ce professionnel.' };
      }
      throw error;
    }

    revalidatePath('/dashboard/manager/calendar');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Quick update for drag & drop / resize (no form, just JSON)
 */
export async function moveAppointment(id: string, start_time: string, end_time: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  try {
    const { data: est } = await supabase
      .from('establishments')
      .select('id')
      .eq('manager_id', user.id)
      .maybeSingle();

    if (!est) throw new Error('Établissement introuvable');

    const { error } = await supabase
      .from('appointments')
      .update({ start_time, end_time })
      .eq('id', id)
      .eq('establishment_id', est.id);

    if (error) {
      if (error.message.includes('double_booking')) {
        return { success: false, error: 'Ce créneau est déjà réservé.' };
      }
      throw error;
    }

    revalidatePath('/dashboard/manager/calendar');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Delete (cancel) an appointment
 */
export async function deleteAppointment(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  try {
    const { data: est } = await supabase
      .from('establishments')
      .select('id')
      .eq('manager_id', user.id)
      .maybeSingle();

    if (!est) throw new Error('Établissement introuvable');

    // Soft-delete: set status to cancelled
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('establishment_id', est.id);

    if (error) throw error;

    revalidatePath('/dashboard/manager/calendar');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
