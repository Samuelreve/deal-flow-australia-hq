-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Secure: Users view own profile only, admins view all" ON public.profiles;

-- Create a new policy that allows users to see profiles of people they share deals with
CREATE POLICY "Users can view profiles of deal participants and their own" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can always see their own profile
  auth.uid() = id 
  OR 
  -- Admins can see all profiles
  get_current_user_role() = 'admin'::text
  OR
  -- Users can see profiles of people they share deals with
  shares_deal_with(id)
);