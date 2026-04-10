'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
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

export async function updateEstablishmentProfile(formData: FormData) {
  const supabase = await createClient();

  // 1. Get current logged in user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) {
    console.error("Auth Context Error during Action:", authError);
    return { success: false, error: 'Non autorisé (Session expirée, veuillez rafraîchir la page)' };
  }

  const name = formData.get('name')?.toString();
  const description = formData.get('description')?.toString();
  const category = formData.get('category')?.toString();
  const address = formData.get('address')?.toString();
  const phone = formData.get('phone')?.toString();
  const contact_email = formData.get('contact_email')?.toString();

  if (!name) {
    return { success: false, error: 'Le nom est requis' };
  }

  const { error } = await supabase
    .from('establishments')
    .update({
      name,
      description,
      category,
      address,
      phone,
      contact_email
    })
    .eq('manager_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/manager/profile');
  revalidatePath('/dashboard/manager');

  return { success: true };
}

export async function updateEstablishmentHours(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  const working_hours_str = formData.get('working_hours')?.toString();
  if (!working_hours_str) return { success: false, error: 'Données invalides' };

  try {
    const working_hours = JSON.parse(working_hours_str);
    const { error } = await supabase
      .from('establishments')
      .update({ working_hours })
      .eq('manager_id', user.id);

    if (error) throw error;

    revalidatePath('/dashboard/manager/profile');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function addService(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  const name = formData.get('name')?.toString();
  const duration_minutes = parseInt(formData.get('duration_minutes')?.toString() || '30', 10);

  if (!name) return { success: false, error: 'Le nom du service est requis' };

  try {
    // Enforce fetching the manager's establishment id
    const { data: est, error: estError } = await supabase
      .from('establishments')
      .select('id')
      .eq('manager_id', user.id)
      .single();

    if (estError || !est) throw new Error("Établissement introuvable");

    const { error } = await supabase
      .from('services')
      .insert({
        name,
        duration_minutes,
        establishment_id: est.id,
        is_active: true
      });

    if (error) throw error;

    revalidatePath('/dashboard/manager/profile');
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
    // Find the establishment for the manager to safely delete the right service
    const { data: est, error: estError } = await supabase
      .from('establishments')
      .select('id')
      .eq('manager_id', user.id)
      .single();

    if (estError || !est) throw new Error("Établissement introuvable");

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId)
      .eq('establishment_id', est.id);

    if (error) throw error;

    revalidatePath('/dashboard/manager/profile');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

