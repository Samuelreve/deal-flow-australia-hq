-- Add RLS policies for profiles table to allow deal participants to see each other
-- First enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles of other deal participants" ON public.profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

-- Allow users to view profiles of other users in deals they participate in
CREATE POLICY "Users can view profiles of deal participants" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.deal_participants dp1
    JOIN public.deal_participants dp2 ON dp1.deal_id = dp2.deal_id
    WHERE dp1.user_id = auth.uid() 
    AND dp2.user_id = profiles.id
  )
);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid());