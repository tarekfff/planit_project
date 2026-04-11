-- New RPC to ensure a profile exists for any logged-in user
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role user_role;
  v_full_name TEXT;
  v_phone TEXT;
BEGIN
  -- Extract from JWT metadata
  v_role := COALESCE((auth.jwt()->'user_metadata'->>'role')::user_role, 'client'::user_role);
  v_full_name := COALESCE(auth.jwt()->'user_metadata'->>'full_name', 'User');
  v_phone := auth.jwt()->'user_metadata'->>'phone';

  INSERT INTO profiles (id, full_name, role, phone)
  VALUES (
    auth.uid(), 
    v_full_name,
    v_role,
    v_phone
  )
  ON CONFLICT (id) DO UPDATE 
  SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone
  WHERE profiles.role = EXCLUDED.role AND (profiles.full_name = 'User' OR profiles.full_name IS NULL);

  RETURN auth.uid();
END;
$$;
