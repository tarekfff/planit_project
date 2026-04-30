'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createNotification } from '@/modules/notifications/actions';
import { sendAppointmentConfirmationEmail } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase/admin';

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
    let estId = null;
    const { data: est } = await supabase.from('establishments').select('id').eq('manager_id', user.id).maybeSingle();
    if (est) {
      estId = est.id;
    } else {
      const { data: prof } = await supabase.from('professionals').select('establishment_id').eq('user_id', user.id).maybeSingle();
      if (prof) estId = prof.establishment_id;
    }

    if (!estId) throw new Error('Établissement introuvable');

    // Find or create a "walk-in" client profile for manager-created appointments
    // For now, use the manager's own ID as client_id (the manager books on behalf)
    // In production, you'd have a proper client lookup/creation flow
    const clientId = user.id;

    const { error } = await supabase
      .from('appointments')
      .insert({
        establishment_id: estId,
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
    let estId = null;
    const { data: est } = await supabase.from('establishments').select('id').eq('manager_id', user.id).maybeSingle();
    if (est) {
      estId = est.id;
    } else {
      const { data: prof } = await supabase.from('professionals').select('establishment_id').eq('user_id', user.id).maybeSingle();
      if (prof) estId = prof.establishment_id;
    }

    if (!estId) throw new Error('Établissement introuvable');

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
      .eq('establishment_id', estId);

    if (error) {
      if (error.message.includes('double_booking')) {
        return { success: false, error: 'Ce créneau est déjà réservé pour ce professionnel.' };
      }
      throw error;
    }

    // Notify the client if the status changed to confirmed or cancelled
    if (parsed.data.status === 'confirmed' || parsed.data.status === 'cancelled') {
      // Fetch the appointment and related data
      const { data: appt } = await supabase
        .from('appointments')
        .select(`
          client_id, 
          services(name),
          start_time,
          establishments!inner(name, address)
        `)
        .eq('id', id)
        .maybeSingle();

      if (appt?.client_id) {
        const serviceName = (appt as any).services?.name || 'votre rendez-vous';
        const establishmentName = (appt as any).establishments?.name || 'Établissement';
        const address = (appt as any).establishments?.address || '';

        if (parsed.data.status === 'confirmed') {
          // 1. In-app notification
          await createNotification({
            userId: appt.client_id,
            actorId: user.id,
            type: 'appointment_accepted',
            title: 'Rendez-vous confirmé !',
            message: `Votre rendez-vous pour ${serviceName} a été confirmé.`,
            link: '/client/appointments',
          });

          // 2. Email notification
          try {
            // Get client's email via supabase admin
            const { data: { user: clientUser } } = await supabaseAdmin.auth.admin.getUserById(appt.client_id);
            const clientName = formData.get('client_name') as string || 'Client';

            if (clientUser?.email) {
              // Send email asynchronously without blocking the response
              sendAppointmentConfirmationEmail({
                to: clientUser.email,
                clientName,
                serviceName,
                establishmentName,
                address,
                startTime: new Date(appt.start_time),
              }).catch(console.error);
            }
          } catch (e) {
            console.error('Erreur lors de la récupération de l\'email client:', e);
          }
        } else if (parsed.data.status === 'cancelled') {
          await createNotification({
            userId: appt.client_id,
            actorId: user.id,
            type: 'appointment_cancelled',
            title: 'Rendez-vous annulé',
            message: `Votre rendez-vous pour ${serviceName} a malheureusement été annulé.`,
            link: '/client/appointments',
          });
        }
      }
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
    let estId = null;
    const { data: est } = await supabase.from('establishments').select('id').eq('manager_id', user.id).maybeSingle();
    if (est) {
      estId = est.id;
    } else {
      const { data: prof } = await supabase.from('professionals').select('establishment_id').eq('user_id', user.id).maybeSingle();
      if (prof) estId = prof.establishment_id;
    }

    if (!estId) throw new Error('Établissement introuvable');

    const { error } = await supabase
      .from('appointments')
      .update({ start_time, end_time })
      .eq('id', id)
      .eq('establishment_id', estId);

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
    let estId = null;
    const { data: est } = await supabase.from('establishments').select('id').eq('manager_id', user.id).maybeSingle();
    if (est) {
      estId = est.id;
    } else {
      const { data: prof } = await supabase.from('professionals').select('establishment_id').eq('user_id', user.id).maybeSingle();
      if (prof) estId = prof.establishment_id;
    }

    if (!estId) throw new Error('Établissement introuvable');

    // Soft-delete: set status to cancelled
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('establishment_id', estId);

    if (error) throw error;

    revalidatePath('/dashboard/manager/calendar');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Create a new appointment requested by a client
 */
export async function createClientAppointment(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Vous devez être connecté.' };

  const raw = Object.fromEntries(formData);
  const estId = raw.establishment_id as string;
  if (!estId) return { success: false, error: 'Établissement manquant' };
  
  try {
    const { error } = await supabase
      .from('appointments')
      .insert({
        establishment_id: estId,
        professional_id: raw.professional_id as string,
        service_id: raw.service_id as string || null,
        client_id: user.id,
        start_time: raw.start_time as string,
        end_time: raw.end_time as string,
        status: 'pending',
        client_notes: raw.client_notes as string || null,
      });

    if (error) {
      if (error.message.includes('double_booking')) {
        return { success: false, error: 'Ce créneau est déjà réservé.' };
      }
      throw error;
    }

    // Notify the manager about the new appointment request
    const { data: establishment } = await supabase
      .from('establishments')
      .select('manager_id, name')
      .eq('id', estId)
      .maybeSingle();

    if (establishment?.manager_id) {
      const startDate = new Date(raw.start_time as string);
      const dateLabel = startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      const timeLabel = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      await createNotification({
        userId: establishment.manager_id,
        actorId: user.id,
        type: 'new_appointment',
        title: 'Nouvelle demande de rendez-vous',
        message: `Un client a demandé un rendez-vous le ${dateLabel} à ${timeLabel} chez ${establishment.name}.`,
        link: '/dashboard/manager/calendar',
      });
    }

    revalidatePath('/client/appointments');
    revalidatePath('/dashboard/manager/calendar');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
