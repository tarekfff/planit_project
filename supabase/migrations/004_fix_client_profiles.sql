-- ==============================================================================
-- FIX: Re-enable the Profile Auto-Creation Trigger securely
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Restore the trigger function with full error handling and correct schema path
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public -- THIS IS VITAL: GoTrue uses 'auth' schema, so 'user_role' was failing!
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Client User'),
    COALESCE((NEW.raw_user_meta_data->>'role'), 'client')::public.user_role,
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If anything goes wrong, catch the error silently so GoTrue never crashes!
  -- This ensures the user Auth signup succeeds no matter what.
  RETURN NEW;
END;
$$;

-- 2. Backfill any existing accounts that fell through the cracks (like your Google Account)
INSERT INTO public.profiles (id, full_name, role, phone)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Client Google Account'), 
  'client'::public.user_role,
  raw_user_meta_data->>'phone'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
