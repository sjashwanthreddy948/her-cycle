-- Backfill profiles for all existing auth.users
INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  COALESCE((raw_user_meta_data->>'role')::public.user_role, 
    CASE WHEN email LIKE '%partner%' THEN 'partner'::public.user_role ELSE 'woman'::public.user_role END
  ),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- Explicitly configure demo accounts
UPDATE public.profiles 
SET role = 'woman', 
    full_name = 'Sarah Miller', 
    avatar_url = '/assets/woman-portrait.png' 
WHERE email = 'demo.woman@hercycle.app';

UPDATE public.profiles 
SET role = 'partner', 
    full_name = 'Alex Rivera',
    avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces'
WHERE email = 'demo.partner@hercycle.app';

-- Create cycle profile for Sarah
INSERT INTO public.cycle_profiles (user_id, average_cycle_length, average_period_length, last_period_start)
SELECT id, 28, 5, CURRENT_DATE - 12
FROM public.profiles
WHERE role = 'woman'
ON CONFLICT (user_id) DO UPDATE
SET average_cycle_length = 28,
    average_period_length = 5,
    last_period_start = CURRENT_DATE - 12;

-- Insert initial sample cycle logs for Sarah
INSERT INTO public.period_logs (user_id, start_date, end_date, flow, notes)
SELECT id, CURRENT_DATE - 12, CURRENT_DATE - 7, 'medium', 'Regular cycle'
FROM public.profiles
WHERE email = 'demo.woman@hercycle.app';

INSERT INTO public.daily_logs (user_id, log_date, mood, energy, sleep_hours, water_glasses, notes)
SELECT id, CURRENT_DATE, 'good', 'medium', 8, 6, 'Feeling healthy and positive'
FROM public.profiles
WHERE email = 'demo.woman@hercycle.app'
ON CONFLICT (user_id, log_date) DO NOTHING;
