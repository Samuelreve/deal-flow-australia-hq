-- Create storage policies for business_document bucket to allow deal participants access

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can access business documents they participate in" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload business documents they participate in" ON storage.objects;
DROP POLICY IF EXISTS "Users can update business documents they participate in" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete business documents they participate in" ON storage.objects;

-- Policy for viewing/downloading files from business_document bucket
CREATE POLICY "Users can access business documents they participate in" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'business_document' 
  AND 
  (
    -- Check if user is a deal participant
    EXISTS (
      SELECT 1 FROM public.deal_participants 
      WHERE deal_participants.deal_id::text = (storage.foldername(name))[1] 
      AND deal_participants.user_id = auth.uid()
    )
    OR
    -- Check if user is the deal owner (seller or buyer)
    EXISTS (
      SELECT 1 FROM public.deals 
      WHERE deals.id::text = (storage.foldername(name))[1] 
      AND (deals.seller_id = auth.uid() OR deals.buyer_id = auth.uid())
    )
  )
);

-- Policy for uploading files to business_document bucket
CREATE POLICY "Users can upload business documents they participate in" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'business_document' 
  AND 
  (
    -- Check if user is a deal participant
    EXISTS (
      SELECT 1 FROM public.deal_participants 
      WHERE deal_participants.deal_id::text = (storage.foldername(name))[1] 
      AND deal_participants.user_id = auth.uid()
    )
    OR
    -- Check if user is the deal owner (seller or buyer)
    EXISTS (
      SELECT 1 FROM public.deals 
      WHERE deals.id::text = (storage.foldername(name))[1] 
      AND (deals.seller_id = auth.uid() OR deals.buyer_id = auth.uid())
    )
  )
);

-- Policy for updating files in business_document bucket
CREATE POLICY "Users can update business documents they participate in" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'business_document' 
  AND owner = auth.uid()
);

-- Policy for deleting files from business_document bucket
CREATE POLICY "Users can delete business documents they participate in" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'business_document' 
  AND owner = auth.uid()
);