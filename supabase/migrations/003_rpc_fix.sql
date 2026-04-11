-- ====================================================================
-- THE FINAL FIX: 
-- 1. Keeps the trigger disabled so signups work reliably.
-- 2. Makes the RPC function handle BOTH profile and establishment setups.
-- Run in Supabase Dashboard → SQL Editor
-- ====================================================================

-- 1. Run this exactly as is to make sure the trigger never crashes again
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Enhance the application RPC to manually create the profile and establishment
CREATE OR REPLACE FUNCTION create_manager_establishment(
  p_name TEXT,
  p_wilaya TEXT DEFAULT 'Non défini',
  p_phone TEXT DEFAULT '',
  p_description TEXT DEFAULT ''
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role user_role;
  v_existing_id UUID;
  v_new_id UUID;
BEGIN
  -- FIRST, ensure the profile exists since the trigger is disabled.
  -- Safe to call multiple times (idempotent uses ON CONFLICT)
  INSERT INTO profiles (id, full_name, role, phone)
  VALUES (
    auth.uid(), 
    COALESCE(auth.jwt()->'user_metadata'->>'full_name', 'Manager'), 
    'manager'::user_role,
    p_phone
  )
  ON CONFLICT (id) DO NOTHING;

  -- Return existing establishment if one already exists 
  SELECT id INTO v_existing_id FROM establishments WHERE manager_id = auth.uid();
  IF v_existing_id IS NOT NULL THEN
    RETURN v_existing_id;
  END IF;

  -- Create the establishment
  INSERT INTO establishments (manager_id, name, wilaya, phone, description)
  VALUES (auth.uid(), p_name, p_wilaya, p_phone, p_description)
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;
