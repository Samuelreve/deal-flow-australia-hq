-- Security Fix: Enhance RLS policies for profiles table to protect user PII
-- This addresses the critical security issue where user personal information could be stolen

-- Ensure RLS is enabled and enforced
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles; 
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create comprehensive and secure RLS policies

-- 1. SELECT Policy: ONLY authenticated users can view profiles (their own OR admin role)
CREATE POLICY "Authenticated users only - view own profile or admin view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  is_profile_owner(auth.uid()) AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 2. INSERT Policy: ONLY authenticated users can insert their own profile
CREATE POLICY "Authenticated users only - insert own profile"
ON public.profiles  
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 3. UPDATE Policy: ONLY authenticated users can update their own profile
CREATE POLICY "Authenticated users only - update own profile" 
ON public.profiles
FOR UPDATE  
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. DELETE Policy: ONLY service_role can delete (no user deletions)
CREATE POLICY "Service role only - delete profiles"
ON public.profiles
FOR DELETE
TO service_role
USING (true);

-- Explicitly deny ALL access to anonymous and public roles
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;

-- Grant minimal necessary permissions to authenticated users only
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Update existing get_public_profile function to be more secure
CREATE OR REPLACE FUNCTION public.get_public_profile(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- CRITICAL: Only allow authenticated users
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Only return LIMITED, NON-SENSITIVE data and only if authorized
  IF auth.uid() = p_user_id OR 
     public.get_current_user_role() = 'admin' OR 
     public.shares_deal_with(p_user_id) THEN
    
    -- Return only safe, non-PII fields
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
      -- DELIBERATELY EXCLUDING: email, phone, company, professional_contact_email, professional_phone
    ) INTO result
    FROM public.profiles p
    WHERE p.id = p_user_id;

    RETURN result;
  END IF;
  
  -- Return NULL for unauthorized access
  RETURN NULL;
END;
$$;

-- Secure the function permissions
REVOKE EXECUTE ON FUNCTION public.get_public_profile(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_public_profile(uuid) FROM anon;  
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;

-- Add security documentation
COMMENT ON TABLE public.profiles IS 'SECURITY CRITICAL: Contains user PII (email, phone, personal data). All access must be authenticated and authorized via RLS policies. No public/anonymous access allowed.';

-- Log the security enhancement in audit table
INSERT INTO public.audit_log (user_id, event, metadata)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  'security_enhancement_applied',
  jsonb_build_object(
    'table', 'profiles',
    'description', 'Enhanced RLS policies to protect user PII',
    'timestamp', now(),
    'policies_updated', jsonb_build_array(
      'Authenticated users only - view own profile or admin view all',
      'Authenticated users only - insert own profile', 
      'Authenticated users only - update own profile',
      'Service role only - delete profiles'
    )
  );