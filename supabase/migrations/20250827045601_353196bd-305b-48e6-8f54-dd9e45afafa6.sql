-- Fix infinite recursion in profiles RLS policy
-- The issue is the policy queries profiles table from within profiles policy

-- Drop the problematic policy
DROP POLICY IF EXISTS "Secure: Users view own profile only, admins view all" ON public.profiles;

-- Create a security definer function to get user role (prevents recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Create new secure policy using the function
CREATE POLICY "Secure: Users view own profile only, admins view all"
ON public.profiles
FOR SELECT
TO authenticated  
USING (
  auth.uid() = id OR 
  public.get_current_user_role() = 'admin'
);

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;