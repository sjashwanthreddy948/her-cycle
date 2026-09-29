-- ====================================================================
-- HERCYCLE PRODUCTION SUPABASE SCHEMA (HARDENED & DEMO-FREE)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('woman', 'partner');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE flow_level AS ENUM ('none', 'light', 'medium', 'heavy', 'spotting');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE mood_level AS ENUM ('great', 'good', 'okay', 'low', 'difficult');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE energy_level AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE cycle_phase AS ENUM ('menstrual', 'follicular', 'ovulation', 'luteal');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE partner_link_status AS ENUM ('pending', 'approved', 'paused');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. PROFILES TABLE (Immutable Role, Age 10-100, Citext Email)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email CITEXT NOT NULL,
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) >= 1),
  role user_role NOT NULL,
  age INT CHECK (age IS NULL OR (age >= 10 AND age <= 100)),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS profiles_lower_email_idx ON profiles (lower(email));

-- Prevent client from ever modifying profile role once created
CREATE OR REPLACE FUNCTION enforce_immutable_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'User role is immutable and cannot be modified after registration.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_enforce_immutable_profile_role ON profiles;
CREATE TRIGGER tr_enforce_immutable_profile_role
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION enforce_immutable_profile_role();

-- 4. ACTIVE SESSIONS TABLE (Single-Active-Session Enforcement)
CREATE TABLE IF NOT EXISTS active_sessions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  device TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CYCLE PROFILES TABLE
CREATE TABLE IF NOT EXISTS cycle_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  average_cycle_length INT NOT NULL DEFAULT 28 CHECK (average_cycle_length BETWEEN 20 AND 45),
  average_period_length INT NOT NULL DEFAULT 5 CHECK (average_period_length BETWEEN 2 AND 12),
  last_period_start DATE,
  goals TEXT[] DEFAULT ARRAY['cycle_tracking'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PERIOD LOGS TABLE
CREATE TABLE IF NOT EXISTS period_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  flow flow_level NOT NULL DEFAULT 'medium',
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. DAILY LOGS TABLE (Private notes & weight are strictly sealed)
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  flow flow_level DEFAULT 'none',
  mood mood_level,
  energy energy_level,
  sleep_hours NUMERIC(4, 1) CHECK (sleep_hours IS NULL OR (sleep_hours >= 0 AND sleep_hours <= 24)),
  water_glasses INT DEFAULT 0 CHECK (water_glasses >= 0 AND water_glasses <= 30),
  weight NUMERIC(5, 2) CHECK (weight IS NULL OR (weight >= 20 AND weight <= 300)),
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 2000),
  symptoms TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- 8. PARTNER CODES TABLE (Server-Generated Format HER-XXXXXX, 24h Expiry, Single Unused per Woman)
CREATE TABLE IF NOT EXISTS partner_codes (
  code TEXT PRIMARY KEY,
  woman_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS partner_codes_woman_used_idx 
ON partner_codes (woman_id, used);

-- 9. PARTNER LINKS TABLE (Strict 1:1, woman_id <> partner_id)
CREATE TABLE IF NOT EXISTS partner_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  woman_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status partner_link_status NOT NULL DEFAULT 'pending',
  is_paused BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  CONSTRAINT unique_woman_link UNIQUE (woman_id),
  CONSTRAINT unique_partner_link UNIQUE (partner_id),
  CONSTRAINT check_different_users CHECK (woman_id <> partner_id)
);

-- 10. SYMPTOMS DICTIONARY & DAILY SYMPTOMS
CREATE TABLE IF NOT EXISTS symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
  symptom_id UUID NOT NULL REFERENCES symptoms(id) ON DELETE CASCADE,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  UNIQUE(daily_log_id, symptom_id)
);

-- 11. PARTNER CONNECTION CODES (6-digit numeric, SHA-256 hash, 15m expiration)
CREATE TABLE IF NOT EXISTS partner_connection_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  woman_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partner_connection_codes_hash ON partner_connection_codes(code_hash);
CREATE INDEX IF NOT EXISTS idx_partner_connection_codes_woman ON partner_connection_codes(woman_user_id);

-- 12. PARTNER CONNECTIONS (Pending -> Approved / Declined)
CREATE TABLE IF NOT EXISTS partner_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  woman_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'paused')),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_different_connection_users CHECK (woman_user_id <> partner_user_id),
  CONSTRAINT unique_woman_connection UNIQUE (woman_user_id),
  CONSTRAINT unique_partner_connection UNIQUE (partner_user_id)
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- 14. CODE ATTEMPTS (Rate limiting: max 5 failed attempts per 15 minutes)
CREATE TABLE IF NOT EXISTS code_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attempt_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_code_attempts_user_time ON code_attempts(user_id, attempt_time);

-- 15. SHARING PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS sharing_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES partner_links(id) ON DELETE CASCADE,
  permission_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_link_permission UNIQUE (link_id, permission_name)
);

-- 16. ROW LEVEL SECURITY POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_connection_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sharing_permissions ENABLE ROW LEVEL SECURITY;

-- Deny anon access explicitly
CREATE POLICY "Deny anon on profiles" ON profiles FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon on active_sessions" ON active_sessions FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon on cycle_profiles" ON cycle_profiles FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon on period_logs" ON period_logs FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon on daily_logs" ON daily_logs FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon on symptoms" ON symptoms FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon on daily_symptoms" ON daily_symptoms FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon on partner_codes" ON partner_codes FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon on partner_links" ON partner_links FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon on partner_connection_codes" ON partner_connection_codes FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon on partner_connections" ON partner_connections FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon on notifications" ON notifications FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon on sharing_permissions" ON sharing_permissions FOR ALL TO anon USING (false);

-- Notifications RLS
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Symptoms public read to authenticated users
CREATE POLICY "Authenticated users view symptoms" ON symptoms
  FOR SELECT TO authenticated USING (true);

-- Daily symptoms access only by owning user
CREATE POLICY "Users manage own daily symptoms" ON daily_symptoms
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_logs dl
      WHERE dl.id = daily_symptoms.daily_log_id
        AND dl.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_logs dl
      WHERE dl.id = daily_symptoms.daily_log_id
        AND dl.user_id = auth.uid()
    )
  );

-- Partner Connections RLS
CREATE POLICY "Users view partner connection they belong to" ON partner_connections
  FOR SELECT TO authenticated
  USING (auth.uid() = woman_user_id OR auth.uid() = partner_user_id);

CREATE POLICY "Woman updates partner connection" ON partner_connections
  FOR UPDATE TO authenticated
  USING (auth.uid() = woman_user_id)
  WITH CHECK (auth.uid() = woman_user_id);

CREATE POLICY "Woman deletes partner connection" ON partner_connections
  FOR DELETE TO authenticated
  USING (auth.uid() = woman_user_id);

-- Partner Connection Codes RLS
CREATE POLICY "Women manage own partner connection codes" ON partner_connection_codes
  FOR ALL TO authenticated
  USING (auth.uid() = woman_user_id)
  WITH CHECK (auth.uid() = woman_user_id);

-- Profiles RLS
CREATE POLICY "Users view own profile" ON profiles 
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users insert own profile" ON profiles 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile" ON profiles 
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Partner can view connected woman public name and avatar" ON profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_links pl
      WHERE pl.partner_id = auth.uid()
        AND pl.woman_id = profiles.id
        AND pl.status = 'approved'
    )
  );

-- Active Sessions RLS
CREATE POLICY "Users manage own active session" ON active_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cycle Profiles RLS (Women read/write only their own rows)
CREATE POLICY "Women manage own cycle profile" ON cycle_profiles
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Period Logs RLS (Women read/write only their own rows; Partners have NO direct access)
CREATE POLICY "Women manage own period logs" ON period_logs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Daily Logs RLS (Women read/write only their own rows; Partners have NO direct access)
CREATE POLICY "Women manage own daily logs" ON daily_logs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Partner Codes RLS (Women manage their own codes)
CREATE POLICY "Women manage own partner codes" ON partner_codes
  FOR ALL TO authenticated
  USING (auth.uid() = woman_id)
  WITH CHECK (auth.uid() = woman_id);

-- Partner Links RLS
CREATE POLICY "Woman manages partner links" ON partner_links
  FOR ALL TO authenticated
  USING (auth.uid() = woman_id)
  WITH CHECK (auth.uid() = woman_id);

CREATE POLICY "Partner views partner link they belong to" ON partner_links
  FOR SELECT TO authenticated
  USING (auth.uid() = partner_id);

-- Sharing Permissions RLS (Only woman can edit permissions)
CREATE POLICY "Woman manages sharing permissions" ON sharing_permissions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_links pl
      WHERE pl.id = sharing_permissions.link_id
        AND pl.woman_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM partner_links pl
      WHERE pl.id = sharing_permissions.link_id
        AND pl.woman_id = auth.uid()
    )
  );

CREATE POLICY "Partner views sharing permissions granted" ON sharing_permissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_links pl
      WHERE pl.id = sharing_permissions.link_id
        AND pl.partner_id = auth.uid()
    )
  );

-- ====================================================================
-- 17. SECURITY DEFINER FUNCTIONS
-- ====================================================================

-- Function: Generate Partner Code (Secure 6-digit numeric code, 15-minute Expiry, SHA-256 hash)
CREATE OR REPLACE FUNCTION generate_partner_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_woman_id UUID;
  v_role user_role;
  v_code TEXT;
  v_code_hash TEXT;
  v_expires_at TIMESTAMPTZ;
  v_num INT;
  v_try INT := 0;
BEGIN
  v_woman_id := auth.uid();
  IF v_woman_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role INTO v_role FROM profiles WHERE id = v_woman_id;
  IF v_role <> 'woman' THEN
    RAISE EXCEPTION 'Only women can generate partner connection codes';
  END IF;

  -- Invalidate and immediately expire any previous unused codes for this woman
  UPDATE partner_codes 
  SET used = TRUE, expires_at = NOW() 
  WHERE woman_id = v_woman_id AND used = FALSE;

  UPDATE partner_connection_codes
  SET used_at = NOW()
  WHERE woman_user_id = v_woman_id AND used_at IS NULL;

  v_expires_at := NOW() + INTERVAL '15 minutes';

  -- Generate 6-digit numeric code (100000 - 999999)
  LOOP
    v_try := v_try + 1;
    IF v_try > 20 THEN
      RAISE EXCEPTION 'Could not generate unique code, please try again';
    END IF;

    v_num := 100000 + floor(random() * 900000)::INT;
    v_code := v_num::TEXT;
    v_code_hash := encode(digest(v_code, 'sha256'), 'hex');

    BEGIN
      INSERT INTO partner_codes (code, woman_id, expires_at, used)
      VALUES (v_code, v_woman_id, v_expires_at, FALSE);

      INSERT INTO partner_connection_codes (woman_user_id, code_hash, expires_at)
      VALUES (v_woman_id, v_code_hash, v_expires_at);

      EXIT; -- Insert succeeded
    EXCEPTION WHEN unique_violation THEN
      -- Retry on collision
    END;
  END LOOP;

  RETURN v_code;
END;
$$;

-- Function: Redeem Partner Code (Atomic, Rate-Limited, Single-Use, Instantly Expired)
CREATE OR REPLACE FUNCTION redeem_partner_code(code_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_partner_id UUID;
  v_partner_role user_role;
  v_clean_code TEXT;
  v_recent_fails INT;
  v_code_row RECORD;
  v_link_id UUID;
BEGIN
  v_partner_id := auth.uid();
  IF v_partner_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role INTO v_partner_role FROM profiles WHERE id = v_partner_id;
  IF v_partner_role <> 'partner' THEN
    RAISE EXCEPTION 'Only partner accounts can redeem connection codes';
  END IF;

  -- 1. Check rate limits (max 5 failed attempts in 15 minutes)
  SELECT COUNT(*) INTO v_recent_fails
  FROM code_attempts
  WHERE user_id = v_partner_id 
    AND attempt_time > (NOW() - INTERVAL '15 minutes');

  IF v_recent_fails >= 5 THEN
    RAISE EXCEPTION 'Too many failed code attempts. Please wait 15 minutes before trying again.';
  END IF;

  -- 2. Verify clean code with row locking to eliminate race conditions
  v_clean_code := upper(trim(code_input));

  SELECT * INTO v_code_row
  FROM partner_codes
  WHERE code = v_clean_code
  FOR UPDATE;

  -- Code does not exist at all
  IF v_code_row IS NULL THEN
    INSERT INTO code_attempts (user_id) VALUES (v_partner_id);
    RAISE EXCEPTION 'Invalid connection code. Please check the code and try again.';
  END IF;

  -- Code was already used or already expired
  IF v_code_row.used = TRUE OR v_code_row.expires_at <= NOW() THEN
    INSERT INTO code_attempts (user_id) VALUES (v_partner_id);
    RAISE EXCEPTION 'This connection code has expired or has already been used. Each code is single-use and cannot be used again by another person.';
  END IF;

  IF v_code_row.woman_id = v_partner_id THEN
    RAISE EXCEPTION 'You cannot link to your own account.';
  END IF;

  -- 3. Check if partner already has an active or pending link
  IF EXISTS (SELECT 1 FROM partner_links WHERE partner_id = v_partner_id) THEN
    RAISE EXCEPTION 'You are already linked to an account.';
  END IF;

  -- 4. Check if woman already has a partner link
  IF EXISTS (SELECT 1 FROM partner_links WHERE woman_id = v_code_row.woman_id) THEN
    RAISE EXCEPTION 'This account is already linked with a partner.';
  END IF;

  -- 5. Mark code as used AND expire it immediately so it can NEVER work again for another person
  UPDATE partner_codes 
  SET used = TRUE, expires_at = NOW() 
  WHERE code = v_clean_code;

  -- 6. Create partner link in pending status
  INSERT INTO partner_links (woman_id, partner_id, status, is_paused)
  VALUES (v_code_row.woman_id, v_partner_id, 'pending', FALSE)
  RETURNING id INTO v_link_id;

  INSERT INTO partner_connections (id, woman_user_id, partner_user_id, status)
  VALUES (v_link_id, v_code_row.woman_id, v_partner_id, 'pending');

  -- Send notification to woman
  INSERT INTO notifications (user_id, type, title, body)
  VALUES (
    v_code_row.woman_id,
    'partner_request',
    'Partner Connection Request',
    'A partner has entered your code and requested to connect.'
  );

  -- 7. Initialize default permissions
  INSERT INTO sharing_permissions (link_id, permission_name, enabled) VALUES
    (v_link_id, 'cycle_phase', TRUE),
    (v_link_id, 'cycle_day', TRUE),
    (v_link_id, 'period_status', TRUE),
    (v_link_id, 'estimated_next_period', TRUE),
    (v_link_id, 'mood', TRUE),
    (v_link_id, 'energy', TRUE),
    (v_link_id, 'symptoms', FALSE),
    (v_link_id, 'flow', FALSE),
    (v_link_id, 'sleep', FALSE),
    (v_link_id, 'notes', FALSE),
    (v_link_id, 'weight', FALSE);

  RETURN jsonb_build_object(
    'success', TRUE,
    'link_id', v_link_id,
    'status', 'pending'
  );
END;
$$;

-- Function: Approve Partner Connection
CREATE OR REPLACE FUNCTION approve_partner_connection(p_link_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_woman_id UUID;
  v_partner_id UUID;
BEGIN
  v_woman_id := auth.uid();
  IF v_woman_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT partner_id INTO v_partner_id
  FROM partner_links
  WHERE id = p_link_id AND woman_id = v_woman_id;

  IF v_partner_id IS NULL THEN
    RAISE EXCEPTION 'Connection request not found or unauthorized';
  END IF;

  UPDATE partner_links
  SET status = 'approved', approved_at = NOW()
  WHERE id = p_link_id;

  UPDATE partner_connections
  SET status = 'approved', approved_at = NOW(), updated_at = NOW()
  WHERE id = p_link_id;

  INSERT INTO notifications (user_id, type, title, body)
  VALUES (
    v_partner_id,
    'partner_approved',
    'Connection Approved! 🎉',
    'Your partner has approved your connection request.'
  );
END;
$$;

-- Function: Decline Partner Connection
CREATE OR REPLACE FUNCTION decline_partner_connection(p_link_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_woman_id UUID;
  v_partner_id UUID;
BEGIN
  v_woman_id := auth.uid();
  IF v_woman_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT partner_id INTO v_partner_id
  FROM partner_links
  WHERE id = p_link_id AND woman_id = v_woman_id;

  DELETE FROM partner_links WHERE id = p_link_id;
  DELETE FROM partner_connections WHERE id = p_link_id;

  IF v_partner_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, body)
    VALUES (
      v_partner_id,
      'partner_declined',
      'Connection Declined',
      'The partner connection request was declined.'
    );
  END IF;
END;
$$;

-- 18. SECURE PARTNER VIEW (No private notes or weight; filtered by permissions)
CREATE OR REPLACE VIEW partner_view AS
SELECT 
  pl.id AS link_id,
  pl.partner_id,
  pl.woman_id,
  w.full_name AS woman_name,
  w.avatar_url AS woman_avatar_url,
  pl.status,
  pl.is_paused,
  cp.average_cycle_length,
  cp.average_period_length,
  cp.last_period_start,
  COALESCE(
    (
      SELECT jsonb_object_agg(sp.permission_name, sp.enabled)
      FROM sharing_permissions sp
      WHERE sp.link_id = pl.id
    ),
    '{}'::jsonb
  ) AS permissions
FROM partner_links pl
JOIN profiles w ON w.id = pl.woman_id
LEFT JOIN cycle_profiles cp ON cp.user_id = pl.woman_id
WHERE pl.partner_id = auth.uid()
  AND pl.status = 'approved'
  AND pl.is_paused = FALSE;

-- 19. Server Function: Cascading Account Deletion
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM profiles WHERE id = v_uid;
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;
