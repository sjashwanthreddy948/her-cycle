-- ====================================================================
-- HERCYCLE PRODUCTION SUPABASE / POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('woman', 'partner');
CREATE TYPE flow_level AS ENUM ('none', 'light', 'medium', 'heavy', 'spotting');
CREATE TYPE mood_level AS ENUM ('great', 'good', 'okay', 'low', 'difficult');
CREATE TYPE energy_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE cycle_phase AS ENUM ('menstrual', 'follicular', 'ovulation', 'luteal');
CREATE TYPE connection_status AS ENUM ('pending', 'active', 'paused', 'rejected', 'disconnected');

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'woman',
  date_of_birth DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CYCLE PROFILES TABLE
CREATE TABLE IF NOT EXISTS cycle_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  average_cycle_length INT NOT NULL DEFAULT 28 CHECK (average_cycle_length BETWEEN 20 AND 45),
  average_period_length INT NOT NULL DEFAULT 5 CHECK (average_period_length BETWEEN 2 AND 12),
  last_period_start DATE,
  goals TEXT[] DEFAULT ARRAY['cycle_tracking'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PERIOD LOGS TABLE
CREATE TABLE IF NOT EXISTS period_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  flow flow_level NOT NULL DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. DAILY LOGS TABLE
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  flow flow_level DEFAULT 'none',
  mood mood_level,
  energy energy_level,
  sleep_hours NUMERIC(4, 1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  water_glasses INT DEFAULT 0 CHECK (water_glasses >= 0),
  weight NUMERIC(5, 2) CHECK (weight >= 0),
  notes TEXT,
  symptoms TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- 7. SYMPTOMS REFERENCE TABLE
CREATE TABLE IF NOT EXISTS symptoms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'physical',
  icon TEXT
);

-- 8. CYCLE PREDICTIONS TABLE
CREATE TABLE IF NOT EXISTS cycle_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  predicted_period_start DATE NOT NULL,
  predicted_period_end DATE NOT NULL,
  predicted_phase cycle_phase NOT NULL,
  cycle_day INT NOT NULL,
  days_until_period INT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PARTNER CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS partner_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  woman_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status connection_status NOT NULL DEFAULT 'pending',
  connection_code VARCHAR(8) UNIQUE NOT NULL,
  is_paused BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  CONSTRAINT unique_woman_partner UNIQUE(woman_user_id, partner_user_id)
);

-- 10. SHARING PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS sharing_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES partner_connections(id) ON DELETE CASCADE,
  permission_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_conn_perm UNIQUE(connection_id, permission_name)
);

-- 11. PARTNER NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS partner_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES partner_connections(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  discreet_wording BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sharing_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_notifications ENABLE ROW LEVEL SECURITY;

-- Symptoms reference table is public read
CREATE POLICY "Public symptoms can be viewed by all authenticated users"
  ON symptoms FOR SELECT TO authenticated USING (true);

-- Profiles RLS
CREATE POLICY "Users can view and update their own profile"
  ON profiles FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Partner can view connected woman's public name and avatar"
  ON profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_connections
      WHERE partner_user_id = auth.uid()
        AND woman_user_id = profiles.id
        AND status = 'active'
    )
  );

-- Cycle Profiles RLS
CREATE POLICY "Woman can manage her cycle profile"
  ON cycle_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Partner can view cycle metrics only if cycle_day is permitted"
  ON cycle_profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_connections pc
      JOIN sharing_permissions sp ON sp.connection_id = pc.id
      WHERE pc.partner_user_id = auth.uid()
        AND pc.woman_user_id = cycle_profiles.user_id
        AND pc.status = 'active'
        AND pc.is_paused = FALSE
        AND sp.permission_name = 'cycle_day'
        AND sp.enabled = TRUE
    )
  );

-- Period Logs RLS
CREATE POLICY "Woman full access to her period logs"
  ON period_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Partner read-only access to period logs if period_status permitted"
  ON period_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_connections pc
      JOIN sharing_permissions sp ON sp.connection_id = pc.id
      WHERE pc.partner_user_id = auth.uid()
        AND pc.woman_user_id = period_logs.user_id
        AND pc.status = 'active'
        AND pc.is_paused = FALSE
        AND sp.permission_name = 'period_status'
        AND sp.enabled = TRUE
    )
  );

-- Daily Logs RLS: Woman has full read/write
CREATE POLICY "Woman full access to daily logs"
  ON daily_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Partner can ONLY view daily logs if sharing is active & not paused
CREATE POLICY "Partner read-only access to daily logs with active connection"
  ON daily_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_connections pc
      WHERE pc.partner_user_id = auth.uid()
        AND pc.woman_user_id = daily_logs.user_id
        AND pc.status = 'active'
        AND pc.is_paused = FALSE
    )
  );

-- Partner Connections RLS
CREATE POLICY "Woman manages her partner connections"
  ON partner_connections FOR ALL TO authenticated
  USING (auth.uid() = woman_user_id)
  WITH CHECK (auth.uid() = woman_user_id);

CREATE POLICY "Partner can view connections they are involved in"
  ON partner_connections FOR SELECT TO authenticated
  USING (auth.uid() = partner_user_id OR auth.uid() = woman_user_id);

CREATE POLICY "Partner can request connection by code"
  ON partner_connections FOR UPDATE TO authenticated
  USING (auth.uid() = partner_user_id OR partner_user_id IS NULL)
  WITH CHECK (auth.uid() = partner_user_id);

-- Sharing Permissions RLS: ONLY woman can edit permissions
CREATE POLICY "Woman controls sharing permissions"
  ON sharing_permissions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_connections pc
      WHERE pc.id = sharing_permissions.connection_id
        AND pc.woman_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM partner_connections pc
      WHERE pc.id = sharing_permissions.connection_id
        AND pc.woman_user_id = auth.uid()
    )
  );

CREATE POLICY "Partner can view permissions granted to him"
  ON sharing_permissions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_connections pc
      WHERE pc.id = sharing_permissions.connection_id
        AND pc.partner_user_id = auth.uid()
    )
  );

-- Helper security functions
CREATE OR REPLACE FUNCTION get_sanitized_partner_daily_log(target_date DATE, woman_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conn_id UUID;
  result JSONB;
  perm_mood BOOLEAN := FALSE;
  perm_energy BOOLEAN := FALSE;
  perm_symptoms BOOLEAN := FALSE;
  perm_flow BOOLEAN := FALSE;
  perm_sleep BOOLEAN := FALSE;
  perm_notes BOOLEAN := FALSE;
BEGIN
  -- Verify active partner connection
  SELECT id INTO conn_id FROM partner_connections
  WHERE woman_user_id = woman_id AND partner_user_id = auth.uid()
    AND status = 'active' AND is_paused = FALSE;
  
  IF conn_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Unauthorized access');
  END IF;

  -- Load permissions
  SELECT enabled INTO perm_mood FROM sharing_permissions WHERE connection_id = conn_id AND permission_name = 'mood';
  SELECT enabled INTO perm_energy FROM sharing_permissions WHERE connection_id = conn_id AND permission_name = 'energy';
  SELECT enabled INTO perm_symptoms FROM sharing_permissions WHERE connection_id = conn_id AND permission_name = 'symptoms';
  SELECT enabled INTO perm_flow FROM sharing_permissions WHERE connection_id = conn_id AND permission_name = 'flow';
  SELECT enabled INTO perm_sleep FROM sharing_permissions WHERE connection_id = conn_id AND permission_name = 'sleep';
  SELECT enabled INTO perm_notes FROM sharing_permissions WHERE connection_id = conn_id AND permission_name = 'notes';

  -- Select and sanitize output
  SELECT jsonb_build_object(
    'log_date', dl.log_date,
    'mood', CASE WHEN perm_mood THEN dl.mood ELSE NULL END,
    'energy', CASE WHEN perm_energy THEN dl.energy ELSE NULL END,
    'symptoms', CASE WHEN perm_symptoms THEN dl.symptoms ELSE ARRAY[]::TEXT[] END,
    'flow', CASE WHEN perm_flow THEN dl.flow ELSE NULL END,
    'sleep_hours', CASE WHEN perm_sleep THEN dl.sleep_hours ELSE NULL END,
    'notes', CASE WHEN perm_notes THEN dl.notes ELSE NULL END
  ) INTO result
  FROM daily_logs dl
  WHERE dl.user_id = woman_id AND dl.log_date = target_date;

  RETURN result;
END;
$$;
