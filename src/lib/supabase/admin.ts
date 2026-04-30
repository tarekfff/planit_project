import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Supabase client with Service Role Key.
 * Bypasses Row Level Security (RLS).
 * NEVER use this on the client-side. ONLY in Server Actions or API Routes.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL and Service Role Key are required for admin client.');
  }

  return createClient<Database>(url, key);
}
