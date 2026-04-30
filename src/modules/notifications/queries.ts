import 'server-only';
import { createClient } from '@/lib/supabase/server';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

/**
 * Fetches all notifications for the currently authenticated user,
 * ordered from newest to oldest.
 */
export async function getNotificationsForUser(): Promise<Notification[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error.message);
    return [];
  }

  return data as Notification[];
}

/**
 * Returns the number of unread notifications for the current user.
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  return count ?? 0;
}
