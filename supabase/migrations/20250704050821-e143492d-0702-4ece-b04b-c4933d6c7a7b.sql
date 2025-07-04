-- Fix infinite recursion in deal_participants RLS policies
-- The issue is that the deal_participants_access policy calls is_deal_participant_or_role
-- which queries deal_participants table, creating recursion

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "deal_participants_access" ON public.deal_participants;

-- Keep the simpler, non-recursive policies that work correctly
-- The existing policies "Deal participants can view other participants" and 
-- "Users can view own participations" are sufficient and non-recursive

-- Add missing INSERT policy for deal_participants (for invitation acceptance)
CREATE POLICY "Users can be added as participants" 
ON public.deal_participants 
FOR INSERT 
WITH CHECK (true); -- This will be controlled by the application logic in edge functions

-- Add UPDATE policy for deal participants  
CREATE POLICY "Deal participants can update their participation" 
ON public.deal_participants 
FOR UPDATE 
USING (user_id = auth.uid());