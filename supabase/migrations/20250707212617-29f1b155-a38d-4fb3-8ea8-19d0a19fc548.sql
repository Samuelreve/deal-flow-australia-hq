-- Update RLS policy to allow deal participants to view deals
DROP POLICY IF EXISTS "Users can view their own deals" ON public.deals;

CREATE POLICY "Users can view deals they participate in" 
ON public.deals 
FOR SELECT 
USING (
  (seller_id = auth.uid()) OR 
  (buyer_id = auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM public.deal_participants 
    WHERE deal_id = deals.id AND user_id = auth.uid()
  ))
);