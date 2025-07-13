-- Drop the existing restrictive policies for business_document bucket
DROP POLICY IF EXISTS "Users can upload their own business documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own business documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own business documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own business documents" ON storage.objects;

-- Create simpler policies for business_document bucket that allow authenticated users to manage their files
CREATE POLICY "Authenticated users can upload to business_document bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'business_document' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view business_document bucket" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'business_document' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update business_document bucket" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'business_document' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete from business_document bucket" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'business_document' AND auth.role() = 'authenticated');