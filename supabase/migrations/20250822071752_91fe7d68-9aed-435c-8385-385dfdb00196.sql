-- Security Fix: Remove overly permissive profile access policy
-- This policy exposed sensitive user data (email, phone, company details) to unauthorized users

-- Drop the problematic policy that allows access to full profile data for deal participants
DROP POLICY IF EXISTS "Users can view profiles of deal participants" ON public.profiles;

-- The existing secure policies remain:
-- 1. "Users can view their own profile" - allows users to see their own full profile
-- 2. "Admins can view all profiles" - allows admins to see all profiles  
-- 3. "Users can update their own profile" - allows users to update their own profile
-- 4. "Users can insert their own profile" - allows users to create their own profile

-- For deal participants to access limited profile information of other participants,
-- they should use the existing get_public_profile() function which only exposes:
-- id, name, role, avatar_url, professional_headline, professional_firm_name, 
-- professional_location, professional_website
-- 
-- This function does NOT expose sensitive data like:
-- email, phone, company, professional_bio, professional_contact_email, professional_phone

-- Add a comment to document the security consideration
COMMENT ON TABLE public.profiles IS 'Contains user profile data. Direct table access is restricted to own profile and admins only. For viewing other users'' profiles in business context, use get_public_profile() function which returns only essential business information.';