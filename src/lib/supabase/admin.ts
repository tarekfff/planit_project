import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Supabase client with Service Role Key.
 * Bypasses Row Level Security (RLS).
 * NEVER use this on the client-side. ONLY in Server Actions or API Routes.
 */
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
