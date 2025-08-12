-- Tighten RLS on public.profiles to prevent public exposure of personal data
DROP POLICY IF EXISTS "profiles_all_access" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.get_current_user_role() = 'admin');

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;