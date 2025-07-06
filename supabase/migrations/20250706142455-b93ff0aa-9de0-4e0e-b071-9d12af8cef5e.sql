-- Create storage policies for deal_documents bucket
-- Allow users to upload files to deals they participate in
CREATE POLICY "Users can upload files to deals they participate in" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'deal_documents' 
  AND 
  (
    -- Check if user is a deal participant
    EXISTS (
      SELECT 1 FROM deal_participants 
      WHERE deal_participants.deal_id::text = (storage.foldername(name))[1] 
      AND deal_participants.user_id = auth.uid()
    )
    OR
    -- Check if user is the deal owner (seller or buyer)
    EXISTS (
      SELECT 1 FROM deals 
      WHERE deals.id::text = (storage.foldername(name))[1] 
      AND (deals.seller_id = auth.uid() OR deals.buyer_id = auth.uid())
    )
  )
);

-- Allow users to view files from deals they participate in
CREATE POLICY "Users can view files from deals they participate in" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'deal_documents' 
  AND 
  (
    -- Check if user is a deal participant
    EXISTS (
      SELECT 1 FROM deal_participants 
      WHERE deal_participants.deal_id::text = (storage.foldername(name))[1] 
      AND deal_participants.user_id = auth.uid()
    )
    OR
    -- Check if user is the deal owner (seller or buyer)
    EXISTS (
      SELECT 1 FROM deals 
      WHERE deals.id::text = (storage.foldername(name))[1] 
      AND (deals.seller_id = auth.uid() OR deals.buyer_id = auth.uid())
    )
  )
);

-- Allow users to update files they uploaded
CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'deal_documents' 
  AND owner = auth.uid()
);

-- Allow users to delete files they uploaded
CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'deal_documents' 
  AND owner = auth.uid()
);