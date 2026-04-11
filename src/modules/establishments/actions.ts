'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { EstablishmentInput, establishmentSchema, profileUpdateSchema, workingHoursSchema, serviceSchema } from './validators';

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

export async function updateEstablishmentProfile(formData: FormData) {
  const supabase = await createClient();

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  // 2. Validate
  const rawData = Object.fromEntries(formData);
  const result = profileUpdateSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { error } = await supabase
    .from('establishments')
    .update(result.data)
    .eq('manager_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/manager/profile');
  return { success: true };
}

export async function updateEstablishmentHours(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  const working_hours_str = formData.get('working_hours')?.toString();
  if (!working_hours_str) return { success: false, error: 'Données invalides' };

  try {
    const hours = JSON.parse(working_hours_str);
    const result = workingHoursSchema.safeParse(hours);

    if (!result.success) {
      return { success: false, error: "Format des horaires invalide" };
    }

    const { error } = await supabase
      .from('establishments')
      .update({ working_hours: result.data })
      .eq('manager_id', user.id);

    if (error) throw error;

    revalidatePath('/dashboard/manager/profile');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function addService(prevState: any, formData: FormData) {
  const { addServiceSchema } = await import('./validators');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  const rawData = Object.fromEntries(formData);
  const result = addServiceSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  try {
    const { data: est, error: estError } = await supabase
      .from('establishments')
      .select('id')
      .eq('manager_id', user.id)
      .maybeSingle();

    if (estError || !est) throw new Error("Établissement introuvable");

    const { error } = await supabase
      .from('services')
      .insert({
        ...result.data,
        establishment_id: est.id
      });

    if (error) throw error;

    revalidatePath('/dashboard/manager/professionals');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateService(prevState: any, formData: FormData) {
  const { editServiceSchema } = await import('./validators');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  const rawData = Object.fromEntries(formData);
  const result = editServiceSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  try {
    const { data: est, error: estError } = await supabase
      .from('establishments')
      .select('id')
      .eq('manager_id', user.id)
      .maybeSingle();

    if (estError || !est) throw new Error("Établissement introuvable");

    const { error } = await supabase
      .from('services')
      .update({
        name: result.data.name,
        duration_minutes: result.data.duration_minutes,
        description: result.data.description,
        is_active: result.data.is_active
      })
      .eq('id', result.data.id)
      .eq('establishment_id', est.id);

    if (error) throw error;

    revalidatePath('/dashboard/manager/professionals');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteService(serviceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  try {
    const { data: est, error: estError } = await supabase
      .from('establishments')
      .select('id')
      .eq('manager_id', user.id)
      .maybeSingle();

    if (estError || !est) throw new Error("Établissement introuvable");

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId)
      .eq('establishment_id', est.id);

    if (error) throw error;

    revalidatePath('/dashboard/manager/professionals');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

