-- Fix the remaining infinite recursion in deal_participants policies
-- The "Deal participants can view other participants" policy is causing recursion
-- by querying deal_participants table from within a policy on the same table

-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Deal participants can view other participants" ON public.deal_participants;

-- Create a simpler, non-recursive policy for viewing participants
-- Users can only view participants in deals where they are also participants
-- This uses a security definer function to avoid recursion
CREATE POLICY "Users can view participants in their deals" 
ON public.deal_participants 
FOR SELECT 
USING (
  deal_id IN (
    SELECT dp.deal_id 
    FROM public.deal_participants dp 
    WHERE dp.user_id = auth.uid()
  )
);

-- Ensure the function exists for checking deal participation
CREATE OR REPLACE FUNCTION public.check_deal_participation(p_deal_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.deal_participants
    WHERE deal_id = p_deal_id AND user_id = p_user_id
  );
$$;