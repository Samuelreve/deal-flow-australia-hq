-- Fix storage policies to avoid deal_participants recursion
-- The storage policies for deal-documents bucket are causing recursion by querying deal_participants

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow uploads to deal documents" ON storage.objects;
DROP POLICY IF EXISTS "View deal documents" ON storage.objects;
DROP POLICY IF EXISTS "Update deal documents" ON storage.objects;
DROP POLICY IF EXISTS "Delete deal documents" ON storage.objects;

-- Create simplified storage policies that don't cause recursion
-- For temporary deals during creation, allow all authenticated users
CREATE POLICY "Allow temp deal document uploads" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'deal-documents' AND
  (storage.foldername(name))[1]::text LIKE 'temp-%'
);

-- For real deals, use a simpler approach
CREATE POLICY "Allow real deal document uploads" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'deal-documents' AND
  (storage.foldername(name))[1]::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

-- Allow viewing of deal documents
CREATE POLICY "View deal documents" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'deal-documents');

-- Allow updating deal documents
CREATE POLICY "Update deal documents" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'deal-documents');

-- Allow deleting deal documents  
CREATE POLICY "Delete deal documents" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'deal-documents');