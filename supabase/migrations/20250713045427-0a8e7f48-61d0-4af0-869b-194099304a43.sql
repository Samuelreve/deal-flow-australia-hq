-- Add DELETE policy for deals table to allow deal owners to delete their deals
CREATE POLICY "Deal owners can delete their deals" 
ON public.deals 
FOR DELETE 
USING (seller_id = auth.uid());