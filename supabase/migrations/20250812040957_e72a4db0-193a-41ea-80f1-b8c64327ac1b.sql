-- Tighten RLS on public.profiles to prevent public exposure of personal data
-- 1) Remove overly-permissive ALL policy that exposed professional profiles to everyone
DROP POLICY IF EXISTS "profiles_all_access" ON public.profiles;

-- 2) Ensure admins can still access profiles for support/compliance
CREATE POLICY IF NOT EXISTS "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.get_current_user_role() = 'admin');

-- 3) Keep existing granular policies (already present):
--    - "Users can view their own profile" (SELECT USING id = auth.uid())
--    - "Users can view profiles of deal participants" (SELECT USING shared deal)
--    - "Users can update their own profile" (UPDATE USING id = auth.uid())
-- These remain untouched.

-- 4) Optional safety: verify RLS is enabled (no-op if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;