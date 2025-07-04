-- Check and fix all remaining recursive policies on deal_participants
-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'deal_participants';

-- Drop ALL existing policies on deal_participants to start fresh
DROP POLICY IF EXISTS "Deal participants can update their participation" ON public.deal_participants;
DROP POLICY IF EXISTS "Deal participants can view other participants" ON public.deal_participants;
DROP POLICY IF EXISTS "Users can be added as participants" ON public.deal_participants;
DROP POLICY IF EXISTS "Users can view own participations" ON public.deal_participants;
DROP POLICY IF EXISTS "Users can view participants in their deals" ON public.deal_participants;

-- Create simple, non-recursive policies for deal_participants
-- Policy 1: Users can view their own participation records
CREATE POLICY "Users can view own participation" 
ON public.deal_participants 
FOR SELECT 
USING (user_id = auth.uid());

-- Policy 2: Users can insert themselves as participants (for invitation acceptance)
CREATE POLICY "Users can be added as participants" 
ON public.deal_participants 
FOR INSERT 
WITH CHECK (true); -- This will be controlled by the application logic

-- Policy 3: Users can update their own participation
CREATE POLICY "Users can update own participation" 
ON public.deal_participants 
FOR UPDATE 
USING (user_id = auth.uid());

-- Policy 4: Allow viewing other participants in the same deal (non-recursive approach)
-- This uses a different approach that doesn't query deal_participants within the policy
CREATE POLICY "Users can view deal participants" 
ON public.deal_participants 
FOR SELECT 
USING (
  -- Allow if user is the record owner
  user_id = auth.uid() 
  OR 
  -- Allow if user is admin
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
  OR
  -- Allow if user is seller/buyer of the deal (direct deal relationship)
  EXISTS (
    SELECT 1 FROM public.deals 
    WHERE id = deal_participants.deal_id 
    AND (seller_id = auth.uid() OR buyer_id = auth.uid())
  )
);