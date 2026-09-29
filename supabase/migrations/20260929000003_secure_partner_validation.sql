-- ====================================================================
-- HERCYCLE: SECURE PARTNER VALIDATION & CRYPTOGRAPHIC CODE GENERATION
-- Migration: 20260929000003_secure_partner_validation.sql
-- ====================================================================

-- Function: Generate Partner Code (Cryptographic 6-digit numeric, 15m timestamptz expiry, verifies DB insert)
CREATE OR REPLACE FUNCTION public.generate_partner_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_woman_id UUID;
  v_role public.user_role;
  v_code TEXT;
  v_code_hash TEXT;
  v_expires_at TIMESTAMPTZ;
  v_num INT;
  v_try INT := 0;
  v_row_id UUID;
BEGIN
  v_woman_id := auth.uid();
  IF v_woman_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_ERROR: Not authenticated';
  END IF;

  SELECT role INTO v_role FROM public.profiles WHERE id = v_woman_id;
  IF v_role <> 'woman' THEN
    RAISE EXCEPTION 'INVALID_ROLE: Only women can generate partner connection codes';
  END IF;

  -- Invalidate and immediately expire any previous unused codes for this woman
  UPDATE public.partner_codes 
  SET used = TRUE, expires_at = NOW() 
  WHERE woman_id = v_woman_id AND used = FALSE;

  UPDATE public.partner_connection_codes
  SET used_at = NOW()
  WHERE woman_user_id = v_woman_id AND used_at IS NULL;

  v_expires_at := NOW() + INTERVAL '15 minutes';

  -- Generate 6-digit numeric code (100000 - 999999) using cryptographic random bytes
  LOOP
    v_try := v_try + 1;
    IF v_try > 25 THEN
      RAISE EXCEPTION 'DATABASE_ERROR: Could not generate unique code, please try again';
    END IF;

    -- Cryptographically secure 6-digit number using gen_random_bytes
    v_num := 100000 + (abs(('x' || encode(gen_random_bytes(4), 'hex'))::bit(31)::int) % 900000);
    v_code := v_num::TEXT;
    v_code_hash := encode(digest(v_code, 'sha256'), 'hex');

    BEGIN
      INSERT INTO public.partner_codes (code, woman_id, expires_at, used)
      VALUES (v_code, v_woman_id, v_expires_at, FALSE);

      INSERT INTO public.partner_connection_codes (woman_user_id, code_hash, expires_at)
      VALUES (v_woman_id, v_code_hash, v_expires_at)
      RETURNING id INTO v_row_id;

      -- Verify row was created
      IF v_row_id IS NULL THEN
        RAISE EXCEPTION 'DATABASE_ERROR: Row creation verification failed';
      END IF;

      EXIT; -- Insert succeeded
    EXCEPTION WHEN unique_violation THEN
      -- Retry on collision
    END;
  END LOOP;

  RETURN v_code;
END;
$$;

-- Function: Validate Partner Connection Code (Atomic, Rate-Limited, Normalized, Returns Specific Error Codes)
CREATE OR REPLACE FUNCTION public.validate_partner_connection_code(entered_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_partner_id UUID;
  v_partner_role public.user_role;
  v_clean_code TEXT;
  v_code_hash TEXT;
  v_recent_fails INT;
  v_code_record RECORD;
  v_link_id UUID;
  v_woman_id UUID;
BEGIN
  -- 1. Get authenticated user ID
  v_partner_id := auth.uid();
  IF v_partner_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_ERROR: Your session has expired. Please log in again.';
  END IF;

  -- 2. Confirm authenticated user profile and role
  SELECT role INTO v_partner_role FROM public.profiles WHERE id = v_partner_id;
  IF v_partner_role IS NULL THEN
    RAISE EXCEPTION 'AUTH_ERROR: User profile not found. Please log in again.';
  END IF;

  IF v_partner_role <> 'partner' THEN
    RAISE EXCEPTION 'INVALID_ROLE: Only partner accounts can enter a connection code.';
  END IF;

  -- 3. Rate limiting (max 5 failed attempts per 15 minutes)
  SELECT COUNT(*) INTO v_recent_fails
  FROM public.code_attempts
  WHERE user_id = v_partner_id 
    AND attempt_time > (NOW() - INTERVAL '15 minutes');

  IF v_recent_fails >= 5 THEN
    RAISE EXCEPTION 'RATE_LIMITED: Too many failed code attempts. Please wait 15 minutes before trying again.';
  END IF;

  -- 4. Normalize code: strictly digits only
  v_clean_code := regexp_replace(entered_code, '\D', '', 'g');
  IF length(v_clean_code) <> 6 THEN
    INSERT INTO public.code_attempts (user_id) VALUES (v_partner_id);
    RAISE EXCEPTION 'INVALID_CODE: That connection code isn''t valid. Please check the code and try again.';
  END IF;

  -- 5. Look up code in partner_codes first (with row lock)
  SELECT code, woman_id, expires_at, used
  INTO v_code_record
  FROM public.partner_codes
  WHERE code = v_clean_code
  FOR UPDATE;

  -- Fallback check in partner_connection_codes by SHA-256 hash
  IF v_code_record IS NULL THEN
    v_code_hash := encode(digest(v_clean_code, 'sha256'), 'hex');
    SELECT pcc.id, pcc.woman_user_id AS woman_id, pcc.expires_at, (pcc.used_at IS NOT NULL) AS used
    INTO v_code_record
    FROM public.partner_connection_codes pcc
    WHERE pcc.code_hash = v_code_hash
    FOR UPDATE;
  END IF;

  -- Code does not exist
  IF v_code_record IS NULL THEN
    INSERT INTO public.code_attempts (user_id) VALUES (v_partner_id);
    RAISE EXCEPTION 'INVALID_CODE: That connection code isn''t valid. Please check the code and try again.';
  END IF;

  v_woman_id := v_code_record.woman_id;

  -- 6. Check expiration using database server time
  IF v_code_record.expires_at <= NOW() THEN
    INSERT INTO public.code_attempts (user_id) VALUES (v_partner_id);
    RAISE EXCEPTION 'EXPIRED: This connection code has expired. Ask your partner to generate a new one.';
  END IF;

  -- 7. Check already used
  IF v_code_record.used = TRUE THEN
    INSERT INTO public.code_attempts (user_id) VALUES (v_partner_id);
    RAISE EXCEPTION 'ALREADY_USED: This connection code has already been used.';
  END IF;

  -- 8. Prevent self-connection
  IF v_woman_id = v_partner_id THEN
    RAISE EXCEPTION 'SELF_CONNECTION: You can''t connect your account to your own account.';
  END IF;

  -- 9. Check if partner already has active or pending connection
  IF EXISTS (SELECT 1 FROM public.partner_links WHERE partner_id = v_partner_id AND status = 'approved') THEN
    RAISE EXCEPTION 'ALREADY_CONNECTED: Your accounts are already connected.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.partner_links WHERE partner_id = v_partner_id AND status = 'pending') THEN
    RAISE EXCEPTION 'PENDING: A connection request is already waiting for approval.';
  END IF;

  -- Check if woman already has an approved partner
  IF EXISTS (SELECT 1 FROM public.partner_links WHERE woman_id = v_woman_id AND status = 'approved') THEN
    RAISE EXCEPTION 'ALREADY_CONNECTED: This woman''s account is already connected to a partner.';
  END IF;

  -- 10. Mark code as used atomically in both tables
  UPDATE public.partner_codes 
  SET used = TRUE, expires_at = NOW() 
  WHERE code = v_clean_code;

  v_code_hash := encode(digest(v_clean_code, 'sha256'), 'hex');
  UPDATE public.partner_connection_codes
  SET used_at = NOW()
  WHERE code_hash = v_code_hash OR woman_user_id = v_woman_id;

  -- 11. Create pending link atomically
  DELETE FROM public.partner_links WHERE partner_id = v_partner_id AND status IN ('declined', 'pending');
  DELETE FROM public.partner_connections WHERE partner_user_id = v_partner_id AND status IN ('declined', 'pending');

  INSERT INTO public.partner_links (woman_id, partner_id, status, is_paused)
  VALUES (v_woman_id, v_partner_id, 'pending', FALSE)
  RETURNING id INTO v_link_id;

  INSERT INTO public.partner_connections (id, woman_user_id, partner_user_id, status)
  VALUES (v_link_id, v_woman_id, v_partner_id, 'pending')
  ON CONFLICT (id) DO UPDATE SET status = 'pending', updated_at = NOW();

  -- 12. Send notification to woman
  INSERT INTO public.notifications (user_id, type, title, body)
  VALUES (
    v_woman_id,
    'partner_request',
    'Partner Connection Request',
    'A partner has entered your code and requested to connect.'
  );

  -- 13. Initialize default sharing permissions
  DELETE FROM public.sharing_permissions WHERE link_id = v_link_id;
  INSERT INTO public.sharing_permissions (link_id, permission_name, enabled) VALUES
    (v_link_id, 'cycle_phase', TRUE),
    (v_link_id, 'cycle_day', TRUE),
    (v_link_id, 'period_status', TRUE),
    (v_link_id, 'estimated_next_period', TRUE),
    (v_link_id, 'mood', FALSE),
    (v_link_id, 'energy', FALSE),
    (v_link_id, 'symptoms', FALSE),
    (v_link_id, 'flow', FALSE),
    (v_link_id, 'sleep', FALSE),
    (v_link_id, 'notes', FALSE),
    (v_link_id, 'weight', FALSE);

  -- 14. Return safe result
  RETURN jsonb_build_object(
    'success', TRUE,
    'connection_id', v_link_id,
    'woman_user_id', v_woman_id,
    'status', 'pending'
  );
END;
$$;

-- Function: Redeem Partner Code (Compatibility alias for validate_partner_connection_code)
CREATE OR REPLACE FUNCTION public.redeem_partner_code(code_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.validate_partner_connection_code(code_input);
END;
$$;
