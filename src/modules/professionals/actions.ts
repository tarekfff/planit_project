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

export async function addProfessionalStaff(prevState: any, formData: FormData) {
  const { addStaffSchema } = await import('./validators');
  const parsed = addStaffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { full_name, email, phone, bio, password, is_active } = parsed.data;
  const supabase = await createClient();

  const { data: { user: manager } } = await supabase.auth.getUser();
  if (!manager) return { success: false, error: 'Non autorisé' };

  // Find manager's establishment
  const { data: est } = await supabase
    .from('establishments')
    .select('id')
    .eq('manager_id', manager.id)
    .single();

  if (!est) return { success: false, error: 'Établissement introuvable' };

  let authUserId = null;

  // If email and password are provided, create the auth user
  if (email && password) {
    const { createClient: createRawClient } = await import('@supabase/supabase-js');
    const rawSupabase = createRawClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: authData, error: authError } = await rawSupabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, role: 'professional', phone } }
    });

    if (authError || (authData.user?.identities && authData.user.identities.length === 0)) {
      return { success: false, error: "L'email est déjà utilisé ou invalide." };
    }
    
    authUserId = authData.user?.id;
  }

  const { error } = await supabase
    .from('professionals')
    .insert({
      establishment_id: est.id,
      // user_id: authUserId, // Omitted to prevent FK violation since profile trigger is disabled
      full_name,
      bio,
      is_active
    });

  if (error) return { success: false, error: error.message };

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/dashboard/manager/professionals');
  return { success: true };
}

export async function editProfessionalStaff(prevState: any, formData: FormData) {
  const { editStaffSchema } = await import('./validators');
  const parsed = editStaffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { id, full_name, bio, is_active } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from('professionals')
    .update({ full_name, bio, is_active })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/dashboard/manager/professionals');
  return { success: true };
}
