-- ====================================================================
-- HERCYCLE: RLS FIX FOR PROFILES TABLE TO ALLOW LINKED PARTNER VISIBILITY
-- Migration: 20260929000005_fix_profiles_rls.sql
-- ====================================================================

-- 1. Drop old restrictive policy if it exists
DROP POLICY IF EXISTS "Partner can view connected woman public name and avatar" ON public.profiles;
DROP POLICY IF EXISTS "Linked users view partner public profile" ON public.profiles;

-- 2. Create bidirectional policy allowing connected/requesting users to see each other's names and avatars
CREATE POLICY "Linked users view partner public profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_links pl
      WHERE (pl.partner_id = auth.uid() AND pl.woman_id = public.profiles.id)
         OR (pl.woman_id = auth.uid() AND pl.partner_id = public.profiles.id)
    )
    OR
    EXISTS (
      SELECT 1 FROM public.partner_connections pc
      WHERE (pc.partner_user_id = auth.uid() AND pc.woman_user_id = public.profiles.id)
         OR (pc.woman_user_id = auth.uid() AND pc.partner_user_id = public.profiles.id)
    )
  );
