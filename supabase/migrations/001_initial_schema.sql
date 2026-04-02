-- =================================================================
-- PLANIT — Complete Database Schema
-- Stack: Supabase (PostgreSQL)
-- Run this in: Supabase Dashboard > SQL Editor
-- =================================================================


-- =================================================================
-- 1. ENUMS
-- =================================================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'professional', 'client');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');


-- =================================================================
-- 2. SHARED TRIGGER FUNCTION — auto-updates updated_at
-- Apply this to every table that needs it.
-- =================================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =================================================================
-- 3. PROFILES
-- Linked 1-to-1 with Supabase auth.users.
-- Auto-created on signup via trigger below.
-- =================================================================

CREATE TABLE profiles (
  id          UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role        user_role NOT NULL DEFAULT 'client',
  full_name   TEXT NOT NULL,
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: keep updated_at fresh
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Trigger: auto-create a profile row when a user signs up
-- The full_name and role are passed via signUp({ options: { data: { full_name, role } } })
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Create a secure function that bypasses RLS to check the exact role without causing infinite loops
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
  RETURN v_role;
END;
$$;

-- Admins can read all profiles (for admin dashboard)
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'admin'
  );


-- =================================================================
-- 4. ESTABLISHMENTS
-- =================================================================

CREATE TABLE establishments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  address      TEXT,
  wilaya       TEXT,           -- Algerian province (Alger, Oran, Constantine…)
  phone        TEXT,
  logo_url     TEXT,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_establishments_updated_at
  BEFORE UPDATE ON establishments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Indexes for common queries
CREATE INDEX idx_establishments_manager   ON establishments(manager_id);
CREATE INDEX idx_establishments_wilaya    ON establishments(wilaya);
CREATE INDEX idx_establishments_is_active ON establishments(is_active);

-- RLS
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

-- Anyone (even unauthenticated) can discover active establishments
CREATE POLICY "Public can view active establishments"
  ON establishments FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Managers can update their own establishment"
  ON establishments FOR UPDATE TO authenticated
  USING (auth.uid() = manager_id);

CREATE POLICY "Managers can insert establishments"
  ON establishments FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = manager_id AND
    public.get_my_role() IN ('manager', 'admin')
  );

CREATE POLICY "Admins have full access on establishments"
  ON establishments FOR ALL TO authenticated
  USING (
    public.get_my_role() = 'admin'
  );


-- =================================================================
-- 5. PROFESSIONALS
-- =================================================================

CREATE TABLE professionals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES profiles(id) ON DELETE SET NULL, -- optional login
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
  full_name        TEXT NOT NULL,
  bio              TEXT,
  avatar_url       TEXT,
  -- working_hours format:
  -- { "monday":    { "active": true,  "start": "08:00", "end": "17:00" },
  --   "tuesday":   { "active": true,  "start": "08:00", "end": "17:00" },
  --   "wednesday": { "active": false, "start": null,    "end": null    }, ... }
  working_hours    JSONB DEFAULT '{}',
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_professionals_establishment ON professionals(establishment_id);
CREATE INDEX idx_professionals_user_id       ON professionals(user_id);

-- RLS
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active professionals"
  ON professionals FOR SELECT
  USING (is_active = TRUE);

-- Managers manage all professionals inside their establishment
CREATE POLICY "Managers can manage their professionals"
  ON professionals FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM establishments e
      WHERE e.id = establishment_id
        AND e.manager_id = auth.uid()
    )
  );

-- A professional can update their own row (bio, avatar…)
CREATE POLICY "Professionals can update own record"
  ON professionals FOR UPDATE TO authenticated
  USING (user_id = auth.uid());


-- =================================================================
-- 6. SERVICES
-- =================================================================

CREATE TABLE services (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id  UUID REFERENCES professionals(id) ON DELETE CASCADE,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
  name             TEXT NOT NULL,
  description      TEXT,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 480),
  price            NUMERIC(10, 2) CHECK (price >= 0),
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_services_professional  ON services(professional_id);
CREATE INDEX idx_services_establishment ON services(establishment_id);

-- RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active services"
  ON services FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Managers can manage services in their establishment"
  ON services FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM establishments e
      WHERE e.id = establishment_id
        AND e.manager_id = auth.uid()
    )
  );


-- =================================================================
-- 7. APPOINTMENTS
-- =================================================================

CREATE TABLE appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  professional_id  UUID REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  service_id       UUID REFERENCES services(id) ON DELETE SET NULL,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
  start_time       TIMESTAMPTZ NOT NULL,
  end_time         TIMESTAMPTZ NOT NULL,
  status           appointment_status DEFAULT 'pending',
  client_notes     TEXT,       -- visible to client + manager
  internal_notes   TEXT,       -- visible to manager + professional only
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT end_after_start CHECK (end_time > start_time)
);

CREATE TRIGGER set_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_appointments_client          ON appointments(client_id);
CREATE INDEX idx_appointments_professional    ON appointments(professional_id);
CREATE INDEX idx_appointments_establishment   ON appointments(establishment_id);
CREATE INDEX idx_appointments_start_time      ON appointments(start_time);
CREATE INDEX idx_appointments_status          ON appointments(status);
-- Composite: most common dashboard query
CREATE INDEX idx_appointments_pro_start ON appointments(professional_id, start_time);

-- -----------------------------------------------------------------
-- TRIGGER: Prevent double-booking
-- Runs BEFORE every INSERT or UPDATE. Raises an exception if the
-- professional already has a non-cancelled appointment overlapping
-- the requested time window.
-- -----------------------------------------------------------------

CREATE OR REPLACE FUNCTION check_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE professional_id = NEW.professional_id
      AND status NOT IN ('cancelled')
      AND id != COALESCE(NEW.id, gen_random_uuid()) -- allow updating own row
      AND tstzrange(NEW.start_time, NEW.end_time, '[)')
          && tstzrange(start_time, end_time, '[)')
  ) THEN
    RAISE EXCEPTION 'double_booking: This time slot is already taken for that professional.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_double_booking
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION check_appointment_overlap();

-- RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Clients: only their own bookings
CREATE POLICY "Clients can view own appointments"
  ON appointments FOR SELECT TO authenticated
  USING (auth.uid() = client_id);

-- Professionals: all bookings assigned to them
CREATE POLICY "Professionals can view their schedule"
  ON appointments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = professional_id
        AND p.user_id = auth.uid()
    )
  );

-- Managers: all appointments in their establishment
CREATE POLICY "Managers can view all appointments in their establishment"
  ON appointments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM establishments e
      WHERE e.id = establishment_id
        AND e.manager_id = auth.uid()
    )
  );

-- Clients can create bookings for themselves only
CREATE POLICY "Clients can book appointments"
  ON appointments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id);

-- Managers and professionals can book appointments on behalf of clients
CREATE POLICY "Staff can create appointments"
  ON appointments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM establishments e
      WHERE e.id = establishment_id AND e.manager_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = professional_id AND p.user_id = auth.uid()
    )
  );

-- Clients can only cancel (not change times or professional)
CREATE POLICY "Clients can cancel own appointments"
  ON appointments FOR UPDATE TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (status = 'cancelled');

-- Managers and professionals can update status / internal notes
CREATE POLICY "Staff can update appointment status"
  ON appointments FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM establishments e
      WHERE e.id = establishment_id AND e.manager_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = professional_id AND p.user_id = auth.uid()
    )
  );


-- =================================================================
-- 8. AVAILABILITY EXCEPTIONS
-- Represents days when a professional is unavailable
-- (holidays, sick leave, vacations).
-- =================================================================

CREATE TABLE availability_exceptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  date            DATE NOT NULL,
  reason          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(professional_id, date)
);

CREATE INDEX idx_availability_exceptions_professional ON availability_exceptions(professional_id);
CREATE INDEX idx_availability_exceptions_date         ON availability_exceptions(date);

ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;

-- Anyone can read exceptions (needed by the booking calendar)
CREATE POLICY "Public can read availability exceptions"
  ON availability_exceptions FOR SELECT USING (TRUE);

CREATE POLICY "Managers can manage exceptions for their professionals"
  ON availability_exceptions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals p
      JOIN establishments e ON e.id = p.establishment_id
      WHERE p.id = professional_id
        AND e.manager_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can manage own exceptions"
  ON availability_exceptions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = professional_id AND p.user_id = auth.uid()
    )
  );
