-- Strengthen privacy for profiles: restrict full access to owner/admin and provide safe, minimal exposure for deal participants
-- 1) Ensure RLS and remove permissive policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any potentially permissive SELECT policies if they exist
DROP POLICY IF EXISTS "profiles_all_access" ON public.profiles;
DROP POLICY IF EXISTS "Deal participants can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles for deals they participate in" ON public.profiles;

-- Recreate strict policies
-- Owner can view their own full profile
CREATE POLICY IF NOT EXISTS "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Admins can view all profiles (uses existing helper)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.get_current_user_role() = 'admin');

-- Owners can update their own profile
CREATE POLICY IF NOT EXISTS "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Owners can insert their own profile (normally handled by trigger, but keep for safety)
CREATE POLICY IF NOT EXISTS "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Optional: tighten privileges to rely on RLS strictly
REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;

-- 2) Define a minimal, safe public profile type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'public_profile'
  ) THEN
    CREATE TYPE public.public_profile AS (
      id uuid,
      name text,
      role text,
      avatar_url text,
      professional_headline text,
      professional_firm_name text,
      professional_location text,
      professional_website text
    );
  END IF;
END
$$;

-- 3) Helper to check if current user shares a deal with target user
CREATE OR REPLACE FUNCTION public.shares_deal_with(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.deal_participants dp1
    JOIN public.deal_participants dp2 ON dp1.deal_id = dp2.deal_id
    WHERE dp1.user_id = auth.uid()
      AND dp2.user_id = target_user_id
  ) OR EXISTS (
    SELECT 1
    FROM public.deals d
    WHERE (d.seller_id = auth.uid() OR d.buyer_id = auth.uid())
      AND (d.seller_id = target_user_id OR d.buyer_id = target_user_id)
  );
$$;

-- 4) Function to return a single safe public profile (self, admin, or shared deal)
CREATE OR REPLACE FUNCTION public.get_public_profile(p_user_id uuid)
RETURNS public.public_profile
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.public_profile;
BEGIN
  IF auth.uid() = p_user_id OR public.get_current_user_role() = 'admin' OR public.shares_deal_with(p_user_id) THEN
    SELECT 
      p.id,
      p.name,
      p.role::text,
      p.avatar_url,
      p.professional_headline,
      p.professional_firm_name,
      p.professional_location,
      p.professional_website
    INTO result
    FROM public.profiles p
    WHERE p.id = p_user_id;

    RETURN result;
  END IF;
  RETURN NULL;
END;
$$;

-- 5) Function to return safe public profiles for a deal where the caller participates
CREATE OR REPLACE FUNCTION public.get_public_profiles_for_deal(p_deal_id uuid)
RETURNS SETOF public.public_profile
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.role::text,
    p.avatar_url,
    p.professional_headline,
    p.professional_firm_name,
    p.professional_location,
    p.professional_website
  FROM public.deal_participants dp
  JOIN public.profiles p ON p.id = dp.user_id
  WHERE dp.deal_id = p_deal_id
    AND public.is_deal_participant_or_role(p_deal_id);
$$;