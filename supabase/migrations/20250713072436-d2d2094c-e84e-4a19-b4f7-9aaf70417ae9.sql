-- Update the INSERT policy for deal_documents to allow temporary deal uploads
DROP POLICY IF EXISTS "Users can upload deal documents they participate in" ON storage.objects;

CREATE POLICY "Users can upload deal documents they participate in"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'deal_documents'
  AND (
    -- Allow uploads to temporary deal folders (during deal creation)
    (storage.foldername(name))[1] LIKE 'temp-%'
    OR
    -- Allow uploads to real deals where user is participant
    (
      EXISTS ( 
        SELECT 1
        FROM deal_participants
        WHERE deal_participants.deal_id::text = (storage.foldername(name))[1] 
        AND deal_participants.user_id = auth.uid()
      )
    )
    OR
    -- Allow uploads to deals where user is seller/buyer
    (
      EXISTS ( 
        SELECT 1
        FROM deals
        WHERE deals.id::text = (storage.foldername(name))[1] 
        AND (deals.seller_id = auth.uid() OR deals.buyer_id = auth.uid())
      )
    )
  )
);