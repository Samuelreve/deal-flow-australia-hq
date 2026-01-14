-- ===========================================
-- LEGAL ACCEPTANCE SYSTEM MIGRATION
-- ===========================================

-- 1. Create legal_acceptances audit table
CREATE TABLE public.legal_acceptances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  terms_version TEXT NOT NULL,
  privacy_version TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Add columns to profiles table for quick lookup
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS terms_version TEXT,
ADD COLUMN IF NOT EXISTS privacy_accepted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_version TEXT;

-- 3. Enable RLS on legal_acceptances
ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for legal_acceptances
-- Users can view their own acceptances
CREATE POLICY "Users can view own legal acceptances"
ON public.legal_acceptances
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own acceptances
CREATE POLICY "Users can insert own legal acceptances"
ON public.legal_acceptances
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Create indexes for performance
CREATE INDEX idx_legal_acceptances_user_id ON public.legal_acceptances(user_id);
CREATE INDEX idx_legal_acceptances_accepted_at ON public.legal_acceptances(accepted_at DESC);
CREATE INDEX idx_profiles_terms_accepted ON public.profiles(terms_accepted) WHERE terms_accepted = false;

-- 6. Function to check if terms acceptance is required
CREATE OR REPLACE FUNCTION public.check_terms_acceptance_required(
  p_user_id UUID,
  p_terms_version TEXT,
  p_privacy_version TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT terms_accepted, terms_version, privacy_accepted, privacy_version
  INTO v_profile
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- If no profile found, acceptance is required
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  -- Check if terms not accepted or version mismatch
  IF NOT v_profile.terms_accepted OR v_profile.terms_version IS DISTINCT FROM p_terms_version THEN
    RETURN true;
  END IF;
  
  -- Check if privacy not accepted or version mismatch
  IF NOT v_profile.privacy_accepted OR v_profile.privacy_version IS DISTINCT FROM p_privacy_version THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 7. Trigger function to update profiles when legal acceptance is recorded
CREATE OR REPLACE FUNCTION public.update_profile_on_legal_acceptance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    terms_accepted = true,
    terms_accepted_at = NEW.accepted_at,
    terms_version = NEW.terms_version,
    privacy_accepted = true,
    privacy_accepted_at = NEW.accepted_at,
    privacy_version = NEW.privacy_version,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- 8. Create trigger
CREATE TRIGGER trigger_update_profile_on_legal_acceptance
AFTER INSERT ON public.legal_acceptances
FOR EACH ROW
EXECUTE FUNCTION public.update_profile_on_legal_acceptance();

-- 9. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_terms_acceptance_required(UUID, TEXT, TEXT) TO authenticated;