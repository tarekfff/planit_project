'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  actorId?: string;
}

/**
 * Inserts a new notification row for the given user.
 * Called from other server actions (appointments, etc.).
 */
export async function createNotification(data: CreateNotificationParams) {
  // Use admin client to bypass RLS since users cannot insert notifications for others via regular client
  const { error } = await supabaseAdmin.from('notifications').insert({
    user_id: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    link: data.link ?? null,
    actor_id: data.actorId ?? null,
  });

  if (error) console.error('Erreur création notification:', error.message);
  return { success: !error };
}

/**
 * Marks all unread notifications as read for the currently authenticated user.
 */
export async function markAllNotificationsAsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) return { success: false, error: error.message };

  revalidatePath('/client/notifications');
  revalidatePath('/dashboard/manager/notifications');
  return { success: true };
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  return { success: true };
}
