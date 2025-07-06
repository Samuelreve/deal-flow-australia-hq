-- Update the documents table RLS policy to include deal participants
DROP POLICY IF EXISTS "Users can create documents for temp deals" ON documents;

CREATE POLICY "Users can create documents for deals they participate in" 
ON documents 
FOR INSERT 
WITH CHECK (
  -- Allow for temporary deals (existing functionality)
  ((deal_id)::text ~~ 'temp-%'::text) 
  OR 
  -- Allow for deal owners (existing functionality)
  (EXISTS ( 
    SELECT 1 FROM deals 
    WHERE deals.id = documents.deal_id 
    AND (deals.seller_id = auth.uid() OR deals.buyer_id = auth.uid())
  ))
  OR
  -- Allow for deal participants (new functionality)
  (EXISTS (
    SELECT 1 FROM deal_participants 
    WHERE deal_participants.deal_id = documents.deal_id 
    AND deal_participants.user_id = auth.uid()
  ))
);