-- Clean up ALL storage policies for deal-documents bucket to resolve infinite recursion
-- Drop all existing conflicting policies that query deal_participants

-- Drop old problematic policies that cause recursion
DROP POLICY IF EXISTS "Allow participants to upload deal files" ON storage.objects;
DROP POLICY IF EXISTS "Allow participants to download deal files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to update deal files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to delete deal files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload documents for their deals" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents in their deals" ON storage.objects;
DROP POLICY IF EXISTS "deal_documents_storage_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "deal_documents_storage_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "deal_documents_storage_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "deal_documents_storage_delete_policy" ON storage.objects;

-- Drop any other duplicate policies for deal-documents
DROP POLICY IF EXISTS "Users can upload to deal-documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to deal-documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can view deal-documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view deal-documents files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own deal-documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploads in deal-documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own deal-documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads in deal-documents" ON storage.objects;

-- The policies from our previous migration should remain:
-- "Allow temp deal document uploads"
-- "Allow real deal document uploads" 
-- "View deal documents"
-- "Update deal documents"
-- "Delete deal documents"

-- These are simple policies that don't cause recursion