-- =================================================================
-- PLANIT — Nuclear Reset: Drop Everything
-- Run this FIRST in Supabase Dashboard > SQL Editor
-- Then run 001_initial_schema.sql to recreate
-- =================================================================

-- 1. Drop trigger on auth schema (Supabase managed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop tables in reverse dependency order
DROP TABLE IF EXISTS availability_exceptions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;
DROP TABLE IF EXISTS establishments CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. Drop functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS check_appointment_overlap() CASCADE;
DROP FUNCTION IF EXISTS get_my_role() CASCADE;
DROP FUNCTION IF EXISTS create_manager_establishment(TEXT, TEXT, TEXT, TEXT) CASCADE;

-- 4. Drop types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
