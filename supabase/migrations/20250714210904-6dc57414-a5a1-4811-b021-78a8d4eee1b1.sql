-- Create the signed_document storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('signed_document', 'Signed Documents', true);

-- Create storage policies for the signed_document bucket
CREATE POLICY "Users can view signed documents for deals they participate in"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'signed_document' AND
  EXISTS (
    SELECT 1 FROM deal_participants dp
    WHERE dp.deal_id::text = (storage.foldername(name))[1]
    AND dp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload signed documents for deals they participate in"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'signed_document' AND
  EXISTS (
    SELECT 1 FROM deal_participants dp
    WHERE dp.deal_id::text = (storage.foldername(name))[1]
    AND dp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update signed documents for deals they participate in"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'signed_document' AND
  EXISTS (
    SELECT 1 FROM deal_participants dp
    WHERE dp.deal_id::text = (storage.foldername(name))[1]
    AND dp.user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage all signed documents"
ON storage.objects FOR ALL
USING (bucket_id = 'signed_document' AND current_setting('role') = 'service_role');