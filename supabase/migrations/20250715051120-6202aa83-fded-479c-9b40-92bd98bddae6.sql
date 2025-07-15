-- Create policies for signed_document bucket
CREATE POLICY "Allow authenticated users to upload signed documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'signed_document' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view signed documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'signed_document' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete signed documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'signed_document' AND auth.uid() IS NOT NULL);