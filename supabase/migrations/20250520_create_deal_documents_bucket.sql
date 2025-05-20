
-- Create deal-documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('deal-documents', 'Deal Documents', false, 52428800)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the deal-documents bucket
CREATE POLICY "Users can read files from deals they participate in"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'deal-documents' AND 
  EXISTS (
    SELECT 1
    FROM public.deal_participants
    WHERE deal_participants.deal_id::text = (storage.foldername(name))[1]
    AND deal_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload files to deals they participate in"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'deal-documents' AND 
  EXISTS (
    SELECT 1
    FROM public.deal_participants
    WHERE deal_participants.deal_id::text = (storage.foldername(name))[1]
    AND deal_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update files they uploaded"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'deal-documents' AND 
  owner = auth.uid()
);

CREATE POLICY "Users can delete files they uploaded" 
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'deal-documents' AND
  owner = auth.uid()
);
