-- Add DELETE policy for deal_participants table to allow admins and sellers to remove participants
CREATE POLICY "Admins and sellers can remove participants" 
ON public.deal_participants 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.deal_participants dp 
    WHERE dp.deal_id = deal_participants.deal_id 
    AND dp.user_id = auth.uid() 
    AND dp.role IN ('admin', 'seller')
  )
  OR 
  EXISTS (
    SELECT 1 
    FROM public.deals d 
    WHERE d.id = deal_participants.deal_id 
    AND d.seller_id = auth.uid()
  )
);