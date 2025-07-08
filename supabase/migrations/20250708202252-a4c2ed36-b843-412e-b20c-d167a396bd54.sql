-- Update the RLS policy for viewing documents to include deal participants
DROP POLICY IF EXISTS "Users can view documents they can access" ON public.documents;

CREATE POLICY "Users can view documents they can access" 
ON public.documents 
FOR SELECT 
USING (
  -- Allow access to temp documents
  ((deal_id)::text ~~ 'temp-%'::text) OR 
  -- Allow access to documents uploaded by the current user
  (uploaded_by = auth.uid()) OR 
  -- Allow access to documents in deals where user is seller/buyer
  (EXISTS ( 
    SELECT 1
    FROM deals
    WHERE deals.id = documents.deal_id 
    AND (deals.seller_id = auth.uid() OR deals.buyer_id = auth.uid())
  )) OR
  -- Allow access to documents in deals where user is a participant
  (EXISTS ( 
    SELECT 1
    FROM deal_participants
    WHERE deal_participants.deal_id = documents.deal_id 
    AND deal_participants.user_id = auth.uid()
  ))
);