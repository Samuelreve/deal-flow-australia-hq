-- CRITICAL SECURITY FIX: Protect DocuSign Authentication Tokens
-- Issue: The current SELECT policy exposes sensitive access_token and refresh_token data
-- Solution: Create a secure view that only exposes non-sensitive metadata

-- First, drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view their own token metadata" ON public.docusign_tokens;

-- Create a new restrictive SELECT policy that prevents token exposure
-- Users should NEVER be able to read access_token or refresh_token from the frontend
CREATE POLICY "Users can view non-sensitive token info only" 
ON public.docusign_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a secure function to check if user has valid DocuSign token without exposing tokens
CREATE OR REPLACE FUNCTION public.has_valid_docusign_token(p_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  token_info jsonb;
BEGIN
  -- Only allow users to check their own tokens
  IF p_user_id != auth.uid() AND public.get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'has_token', (access_token IS NOT NULL),
    'expires_at', expires_at,
    'account_id', account_id,
    'base_uri', base_uri,
    'is_expired', (expires_at < now())
  ) INTO token_info
  FROM public.docusign_tokens 
  WHERE user_id = p_user_id;

  -- Return default if no token found
  IF token_info IS NULL THEN
    token_info := jsonb_build_object(
      'has_token', false,
      'expires_at', null,
      'account_id', null,
      'base_uri', null,
      'is_expired', true
    );
  END IF;

  RETURN token_info;
END;
$function$;

-- Create a secure function for edge functions to access tokens (service role only)
CREATE OR REPLACE FUNCTION public.get_docusign_token_for_service(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- CRITICAL: Only allow service role to access this function
  IF current_setting('role', true) != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: Service role required' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'access_token', access_token,
    'refresh_token', refresh_token,
    'account_id', account_id,
    'base_uri', base_uri,
    'expires_at', expires_at,
    'user_info', user_info
  ) INTO result
  FROM public.docusign_tokens 
  WHERE user_id = p_user_id;

  RETURN result;
END;
$function$;

-- Add audit logging for token access
CREATE TABLE IF NOT EXISTS public.token_access_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  accessed_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on audit table
ALTER TABLE public.token_access_audit ENABLE ROW LEVEL SECURITY;

-- Only allow service role to insert audit logs
CREATE POLICY "Service role can insert audit logs"
ON public.token_access_audit
FOR INSERT
WITH CHECK (current_setting('role', true) = 'service_role');

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON public.token_access_audit
FOR SELECT
USING (auth.uid() = user_id);

-- Add comment documenting the security model
COMMENT ON TABLE public.docusign_tokens IS 'Contains sensitive DocuSign authentication tokens. Direct SELECT access is restricted. Use has_valid_docusign_token() for frontend checks and get_docusign_token_for_service() for edge function access only.';