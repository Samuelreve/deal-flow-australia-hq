-- SECURITY FIX: Protect user PII in profiles table
-- CRITICAL: Email addresses, phone numbers, and personal data must be secured

-- Enable and enforce RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Remove existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles; 
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Remove insecure public function
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

-- SECURE RLS POLICIES - AUTHENTICATED USERS ONLY

CREATE POLICY "Secure: Users view own profile only, admins view all"
ON public.profiles
FOR SELECT
TO authenticated  
USING (
  auth.uid() = id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Secure: Users create own profile only"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Secure: Users update own profile only"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Secure: System delete only"
ON public.profiles
FOR DELETE
TO service_role
USING (true);

-- REVOKE all public/anonymous access
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;

-- Minimal authenticated permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Create secure function excluding PII
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
  -- Only authenticated users
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check authorization
  IF auth.uid() = p_user_id OR 
     public.get_current_user_role() = 'admin' OR 
     public.shares_deal_with(p_user_id) THEN
    
    -- Safe data only - NO PII
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
    ) INTO result
    FROM public.profiles p
    WHERE p.id = p_user_id;

    RETURN result;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Secure function permissions
REVOKE EXECUTE ON FUNCTION public.get_safe_public_profile(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_safe_public_profile(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_safe_public_profile(uuid) TO authenticated;

-- Security documentation
COMMENT ON TABLE public.profiles IS 'SECURITY: Contains PII (email, phone). Authenticated access only via RLS.';

-- Simple audit entry
INSERT INTO public.audit_log (user_id, event, metadata) 
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'profiles_security_hardening', 
  '{"status": "completed"}'::jsonb
);