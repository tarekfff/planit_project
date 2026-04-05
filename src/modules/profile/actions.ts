'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
    const address = formData.get('address')?.toString();
    const phone = formData.get('phone')?.toString();
    // Assuming email is fetched from auth, we might just update the establishment email if there is a separate one, 
    // but the schema doesn't have an email in establishments, so we skip it.

    if (!name) {
        return { success: false, error: 'Le nom est requis' };
    }

    const { error } = await supabase
        .from('establishments')
        .update({
            name,
            description,
            address,
            phone
        })
        .eq('manager_id', user.id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/manager/profile');
    revalidatePath('/dashboard/manager');

    return { success: true };
}
