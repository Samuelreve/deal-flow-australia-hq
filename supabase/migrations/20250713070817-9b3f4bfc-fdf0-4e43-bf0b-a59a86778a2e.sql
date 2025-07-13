-- Check existing storage policies for deal_documents bucket
SELECT * FROM storage.objects WHERE bucket_id = 'deal_documents' LIMIT 5;

-- Check current policies on storage.objects table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Ensure deal_documents bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public) 
VALUES ('deal_documents', 'deal_documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Create comprehensive storage policies for deal_documents bucket
DROP POLICY IF EXISTS "Users can access deal documents they participate in" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload deal documents they participate in" ON storage.objects;
DROP POLICY IF EXISTS "Users can update deal documents they participate in" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete deal documents they participate in" ON storage.objects;

-- Policy for viewing/downloading files
CREATE POLICY "Users can access deal documents they participate in" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'deal_documents' 
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

-- Policy for uploading files
CREATE POLICY "Users can upload deal documents they participate in" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'deal_documents' 
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

-- Policy for updating files
CREATE POLICY "Users can update deal documents they participate in" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'deal_documents' 
  AND owner = auth.uid()
);

-- Policy for deleting files
CREATE POLICY "Users can delete deal documents they participate in" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'deal_documents' 
  AND owner = auth.uid()
);