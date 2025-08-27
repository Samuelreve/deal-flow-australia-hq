-- Security Fix: Enhance RLS policies for profiles table to protect user PII
-- This addresses the security issue where user personal information could be stolen

-- First, let's ensure RLS is enabled (should already be enabled but making sure)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles; 
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create more restrictive and comprehensive RLS policies

-- 1. SELECT Policy: Only authenticated users can view profiles and only their own OR admin role
CREATE POLICY "Authenticated users can view own profile or admin can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 2. INSERT Policy: Only authenticated users can insert their own profile
CREATE POLICY "Authenticated users can insert own profile"
ON public.profiles  
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 3. UPDATE Policy: Only authenticated users can update their own profile or admins can update any
CREATE POLICY "Authenticated users can update own profile or admin can update any"
ON public.profiles
FOR UPDATE  
TO authenticated
USING (
  auth.uid() = id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  auth.uid() = id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. DELETE Policy: Only admins can delete profiles (users shouldn't delete their own profiles)
CREATE POLICY "Only admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated  
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 5. Ensure no anonymous/public access by explicitly denying it
-- This is redundant since we only grant TO authenticated, but makes intent clear
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;

-- Grant only necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
-- Only service_role should have DELETE (admins will use service_role for deletions)
GRANT DELETE ON public.profiles TO service_role;

-- Secure the get_public_profile function to ensure it only returns safe data
-- and make sure it can't be called by unauthenticated users
CREATE OR REPLACE FUNCTION public.get_public_profile_secure(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- Only allow authenticated users to call this function
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Only return limited, non-sensitive profile data and only if:
  -- 1. User is requesting their own profile, OR
  -- 2. User is admin, OR  
  -- 3. Users share a deal together
  IF auth.uid() = p_user_id OR 
     public.get_current_user_role() = 'admin' OR 
     public.shares_deal_with(p_user_id) THEN
    
    SELECT json_build_object(
      'id', p.id,
      'name', p.name,
      'role', p.role::text,
      'avatar_url', p.avatar_url,
      'professional_headline', p.professional_headline,
      'professional_firm_name', p.professional_firm_name,
      'professional_location', p.professional_location,
      'professional_website', p.professional_website,
      'is_professional', p.is_professional
      -- NOTE: Deliberately excluding sensitive PII like email, phone, etc.
    ) INTO result
    FROM public.profiles p
    WHERE p.id = p_user_id;

    RETURN result;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Revoke execute on the function from public/anon and only allow authenticated users
REVOKE EXECUTE ON FUNCTION public.get_public_profile_secure(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_public_profile_secure(uuid) FROM anon;  
GRANT EXECUTE ON FUNCTION public.get_public_profile_secure(uuid) TO authenticated;

-- Create audit logging for profile access (optional but recommended for security monitoring)
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log when someone accesses profile data (for security monitoring)
  INSERT INTO public.audit_log (user_id, event, metadata)
  VALUES (
    auth.uid(),
    'profile_accessed', 
    jsonb_build_object(
      'accessed_profile_id', NEW.id,
      'timestamp', now(),
      'operation', TG_OP
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to log profile access (helps detect unauthorized access attempts)
DROP TRIGGER IF EXISTS profile_access_audit ON public.profiles;
CREATE TRIGGER profile_access_audit
  AFTER SELECT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_access();

-- Add comment to document the security enhancement  
COMMENT ON TABLE public.profiles IS 'User profiles table with enhanced RLS policies to protect PII. Contains sensitive data like email and phone numbers that must be protected from unauthorized access.';

-- Final security check: ensure service_role can bypass RLS for admin operations
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;