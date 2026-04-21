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
  const payload = Object.fromEntries(formData);
  const serviceIds = formData.getAll('service_ids');
  payload.service_ids = serviceIds as any;

  const parsed = addStaffSchema.safeParse(payload);
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
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { 
        success: false, 
        error: "Erreur Serveur: SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local pour créer un compte directement sans OTP." 
      };
    }

    const { createClient: createRawClient } = await import('@supabase/supabase-js');
    const adminSupabase = createRawClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // <--- bypass email verification OTP
      user_metadata: { full_name, role: 'professional', phone }
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || "L'email est déjà utilisé ou invalide." };
    }
    
    authUserId = authData.user.id;

    // Force profile upsert to prevent FK violation just in case the Postgres trigger is disabled
    await adminSupabase.from('profiles').upsert({
      id: authUserId,
      full_name,
      role: 'professional',
      phone: phone || null
    });
  }

  const { data: newProf, error } = await supabase
    .from('professionals')
    .insert({
      establishment_id: est.id,
      user_id: authUserId, // Now linked properly!
      full_name,
      bio,
      is_active
    })
    .select('id')
    .single();

  if (error || !newProf) return { success: false, error: error?.message || 'Erreur création' };
  
  if (parsed.data.service_ids && parsed.data.service_ids.length > 0) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { createClient: createRawClient } = await import('@supabase/supabase-js');
        const adminSupabase = createRawClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const rows = parsed.data.service_ids.map(sid => ({ professional_id: newProf.id, service_id: sid }));
        await adminSupabase.from('professional_services').insert(rows);
    }
  }

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/dashboard/manager/professionals');
  return { success: true };
}

export async function editProfessionalStaff(prevState: any, formData: FormData) {
  const { editStaffSchema } = await import('./validators');
  const payload = Object.fromEntries(formData);
  const serviceIds = formData.getAll('service_ids');
  payload.service_ids = serviceIds as any;

  const parsed = editStaffSchema.safeParse(payload);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { id, full_name, bio, is_active } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from('professionals')
    .update({ full_name, bio, is_active })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createRawClient } = await import('@supabase/supabase-js');
      const adminSupabase = createRawClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Remove previous assignments for this professional
      await adminSupabase.from('professional_services').delete().eq('professional_id', id);

      // Re-assign newly selected ones
      if (parsed.data.service_ids && parsed.data.service_ids.length > 0) {
        const rows = parsed.data.service_ids.map(sid => ({ professional_id: id, service_id: sid }));
        await adminSupabase.from('professional_services').insert(rows);
      }
  }

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/dashboard/manager/professionals');
  return { success: true };
}

export async function deleteProfessionalStaff(id: string) {
  const supabase = await createClient();
  const { data: { user: manager } } = await supabase.auth.getUser();
  if (!manager) return { success: false, error: 'Non autorisé' };

  // First verify the professional belongs to the manager's establishment
  const { data: professional } = await supabase
    .from('professionals')
    .select(`
      user_id, 
      establishment_id, 
      establishments!inner ( manager_id )
    `)
    .eq('id', id)
    .single() as any;

  if (!professional || professional.establishments?.manager_id !== manager.id) {
    return { success: false, error: 'Accès refusé' };
  }

  // Identify user_id to delete from auth
  const userIdToDelete = professional.user_id;

  // Delete from professionals table
  const { error } = await supabase
    .from('professionals')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  // Delete from auth.users and bypass profile trigger issues (requires service role key)
  if (userIdToDelete && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createClient: createRawClient } = await import('@supabase/supabase-js');
    const adminSupabase = createRawClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    await adminSupabase.auth.admin.deleteUser(userIdToDelete);
  }

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/dashboard/manager/professionals');
  return { success: true };
}

export async function saveProfessionalWorkingHours(hours: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  const { data: prof } = await supabase.from('professionals').select('id').eq('user_id', user.id).single();
  if (!prof) return { success: false, error: 'Profil introuvable' };

  const { error } = await supabase.from('professionals').update({ working_hours: hours }).eq('id', prof.id);
  if (error) return { success: false, error: error.message };
  
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/dashboard/professional/services');
  return { success: true };
}

export async function addProfessionalSpecificService(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const duration_minutes = parseInt(formData.get('duration_minutes') as string);
  
  if (!name || isNaN(duration_minutes)) return { success: false, error: 'Entrée invalide' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  const { data: prof } = await supabase.from('professionals').select('id, establishment_id').eq('user_id', user.id).single();
  if (!prof) return { success: false, error: 'Profil introuvable' };

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Configuration serveur manquante (SERVICE_ROLE_KEY)." };
  }

  const { createClient: createRawClient } = await import('@supabase/supabase-js');
  const adminSupabase = createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { error } = await adminSupabase.from('services').insert({
    name,
    duration_minutes,
    establishment_id: prof.establishment_id,
    is_active: true
  });
  
  if (error) return { success: false, error: error.message };

  // Find the newly created service and link it to this professional
  const { data: newService } = await adminSupabase
    .from('services')
    .select('id')
    .eq('establishment_id', prof.establishment_id)
    .eq('name', name)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (newService) {
    await adminSupabase.from('professional_services').insert({
      professional_id: prof.id,
      service_id: newService.id
    });
  }

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/dashboard/professional/services');
  return { success: true };
}

export async function editProfessionalSpecificService(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const duration_minutes = parseInt(formData.get('duration_minutes') as string);
  
  if (!id || !name || isNaN(duration_minutes)) return { success: false, error: 'Entrée invalide' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  const { data: prof } = await supabase.from('professionals').select('id').eq('user_id', user.id).single();
  if (!prof) return { success: false, error: 'Profil introuvable' };

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Configuration serveur manquante (SERVICE_ROLE_KEY)." };
  }

  const { createClient: createRawClient } = await import('@supabase/supabase-js');
  const adminSupabase = createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { error } = await adminSupabase.from('services').update({ name, duration_minutes }).eq('id', id);
  if (error) return { success: false, error: error.message };

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/dashboard/professional/services');
  return { success: true };
}

export async function deleteProfessionalSpecificService(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  const { data: prof } = await supabase.from('professionals').select('id').eq('user_id', user.id).single();
  if (!prof) return { success: false, error: 'Profil introuvable' };

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Configuration serveur manquante (SERVICE_ROLE_KEY)." };
  }

  const { createClient: createRawClient } = await import('@supabase/supabase-js');
  const adminSupabase = createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // Delete the link in junction table, then delete the service itself
  await adminSupabase.from('professional_services').delete().eq('service_id', id).eq('professional_id', prof.id);
  const { error } = await adminSupabase.from('services').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/dashboard/professional/services');
  return { success: true };
}
