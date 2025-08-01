-- Update the document view policy to include milestone-assigned users
DROP POLICY IF EXISTS "Users can view documents they can access" ON documents;

CREATE POLICY "Users can view documents they can access" ON documents
FOR SELECT 
USING (
  -- Temporary uploads
  (deal_id::text ~~ 'temp-%') OR
  -- Documents they uploaded
  (uploaded_by = auth.uid()) OR
  -- Deal owners can see all documents
  (EXISTS (
    SELECT 1 FROM deals 
    WHERE deals.id = documents.deal_id 
    AND (deals.seller_id = auth.uid() OR deals.buyer_id = auth.uid())
  )) OR
  -- Deal participants can see all documents
  (EXISTS (
    SELECT 1 FROM deal_participants 
    WHERE deal_participants.deal_id = documents.deal_id 
    AND deal_participants.user_id = auth.uid()
  )) OR
  -- Users assigned to milestones can see documents for their assigned milestones
  (milestone_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM milestones 
    WHERE milestones.id = documents.milestone_id 
    AND milestones.assigned_to = auth.uid()
  ))
);