-- Fix existing documents that have incomplete storage paths
-- This will prepend the deal_id to storage_path for documents where the path doesn't already include it

UPDATE public.documents 
SET storage_path = deal_id::text || '/' || storage_path
WHERE storage_path NOT LIKE '%/%'
  AND storage_path != '';

-- Also fix document_versions table
UPDATE public.document_versions 
SET storage_path = (
  SELECT d.deal_id::text || '/' || document_versions.storage_path
  FROM public.documents d 
  WHERE d.id = document_versions.document_id
)
WHERE storage_path NOT LIKE '%/%'
  AND storage_path != '';