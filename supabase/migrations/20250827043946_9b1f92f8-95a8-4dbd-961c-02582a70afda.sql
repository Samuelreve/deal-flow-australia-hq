-- Security Fix: Protect user PII in profiles table
-- Critical security issue: profiles table contains email, phone, and personal data

-- Ensure RLS is enabled and enforced 
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Drop existing policies to recreate with better security
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles; 
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Drop existing function to recreate with secure return type
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

-- Create SECURE RLS policies - AUTHENTICATED USERS ONLY

-- 1. SELECT: Only authenticated users can view their own profile OR admins can view all
CREATE POLICY "AUTH ONLY: Users view own profile, admins view all"
ON public.profiles
FOR SELECT
TO authenticated  
USING (
  auth.uid() = id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 2. INSERT: Only authenticated users can create their own profile
CREATE POLICY "AUTH ONLY: Users create own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 3. UPDATE: Only authenticated users can update their own profile  
CREATE POLICY "AUTH ONLY: Users update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. DELETE: Only service_role (system) can delete profiles
CREATE POLICY "SERVICE ROLE ONLY: Delete profiles"
ON public.profiles
FOR DELETE
TO service_role
USING (true);

-- CRITICAL: Explicitly revoke ALL access from anonymous/public users
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;

-- Grant minimal permissions to authenticated users only
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Create new secure function that excludes PII data
CREATE FUNCTION public.get_safe_public_profile(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- SECURITY CHECK: Only authenticated users allowed
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Authorization check: own profile, admin, or shared deal participant
  IF auth.uid() = p_user_id OR 
     public.get_current_user_role() = 'admin' OR 
     public.shares_deal_with(p_user_id) THEN
    
    -- Return ONLY safe, non-PII data
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
      -- SECURITY NOTE: Excludes email, phone, company, professional_contact_email, professional_phone
    ) INTO result
    FROM public.profiles p
    WHERE p.id = p_user_id;

    RETURN result;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Secure function permissions - authenticated users only
REVOKE EXECUTE ON FUNCTION public.get_safe_public_profile(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_safe_public_profile(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_safe_public_profile(uuid) TO authenticated;

-- Document the security enhancement
COMMENT ON TABLE public.profiles IS 'SECURITY CRITICAL: Contains user PII (email, phone numbers, personal data). Access strictly controlled via RLS. NO anonymous access permitted.';

-- Audit log entry for security enhancement
INSERT INTO public.audit_log (user_id, event, metadata) 
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'profiles_security_hardening', 
  '{"description": "Applied strict RLS policies to protect user PII", "timestamp": "' || now()::text || '", "affected_table": "profiles"}'::jsonb
);