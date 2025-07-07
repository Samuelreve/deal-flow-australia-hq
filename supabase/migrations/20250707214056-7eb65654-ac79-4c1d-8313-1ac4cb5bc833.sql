-- Fix the RLS policy to allow participants to see all other participants in their deals
-- Drop the current policy
DROP POLICY IF EXISTS "Users can view participants for deals they own or participate in" ON public.deal_participants;

-- Update the security definer function to also check deal participation
CREATE OR REPLACE FUNCTION public.is_deal_owner_or_participant(p_deal_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.deals 
    WHERE id = p_deal_id 
    AND (seller_id = p_user_id OR buyer_id = p_user_id)
  ) OR EXISTS (
    SELECT 1 FROM public.deal_participants 
    WHERE deal_id = p_deal_id 
    AND user_id = p_user_id
  );
$$;

-- Create new RLS policy that allows participants to see all participants in deals they're involved in
CREATE POLICY "Users can view all participants for deals they are involved in" 
ON public.deal_participants 
FOR SELECT 
USING (
  is_deal_owner_or_participant(deal_id)
);