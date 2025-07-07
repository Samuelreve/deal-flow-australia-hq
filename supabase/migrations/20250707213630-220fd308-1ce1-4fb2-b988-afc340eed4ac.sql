-- Drop existing problematic policies on deal_participants
DROP POLICY IF EXISTS "Users can view deal participants" ON public.deal_participants;
DROP POLICY IF EXISTS "Users can view own participation" ON public.deal_participants;

-- Create a security definer function to check deal ownership/participation without recursion
CREATE OR REPLACE FUNCTION public.is_deal_owner_or_participant(p_deal_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.deals 
    WHERE id = p_deal_id 
    AND (seller_id = p_user_id OR buyer_id = p_user_id)
  );
$$;

-- Create new RLS policies using the security definer function
CREATE POLICY "Users can view participants for deals they own or participate in" 
ON public.deal_participants 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  is_deal_owner_or_participant(deal_id)
);