-- Auto-confirm emails so users can immediately log in across devices without email server
CREATE OR REPLACE FUNCTION public.auto_confirm_user_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_auto_confirm_user_email ON auth.users;
CREATE TRIGGER tr_auto_confirm_user_email
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user_email();

-- Confirm any existing users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Automatically create profiles and cycle profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role public.user_role;
  v_cycle_len INT;
  v_period_len INT;
  v_last_start DATE;
BEGIN
  -- Determine role
  BEGIN
    v_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'woman'::public.user_role;
  END;

  INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    v_role,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

  IF v_role = 'woman' THEN
    v_cycle_len := COALESCE(NULLIF(NEW.raw_user_meta_data->>'average_cycle_length', '')::INT, 28);
    v_period_len := COALESCE(NULLIF(NEW.raw_user_meta_data->>'average_period_length', '')::INT, 5);
    BEGIN
      v_last_start := (NEW.raw_user_meta_data->>'last_period_start')::DATE;
    EXCEPTION WHEN OTHERS THEN
      v_last_start := NULL;
    END;

    INSERT INTO public.cycle_profiles (user_id, average_cycle_length, average_period_length, last_period_start)
    VALUES (NEW.id, v_cycle_len, v_period_len, v_last_start)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_handle_new_user ON auth.users;
CREATE TRIGGER tr_handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
