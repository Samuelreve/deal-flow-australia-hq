-- Fix document storage paths to remove dealId prefix from storage_path
UPDATE public.documents 
SET storage_path = CASE 
    WHEN storage_path LIKE deal_id::text || '/%' THEN 
        substring(storage_path from length(deal_id::text) + 2)
    ELSE storage_path 
END
WHERE storage_path LIKE deal_id::text || '/%';

-- Fix document_versions storage paths to remove dealId prefix from storage_path  
UPDATE public.document_versions
SET storage_path = CASE
    WHEN storage_path LIKE (SELECT d.deal_id::text FROM documents d WHERE d.id = document_versions.document_id) || '/%' THEN
        substring(storage_path from length((SELECT d.deal_id::text FROM documents d WHERE d.id = document_versions.document_id)) + 2)
    ELSE storage_path
END
WHERE EXISTS (
    SELECT 1 FROM documents d 
    WHERE d.id = document_versions.document_id 
    AND document_versions.storage_path LIKE d.deal_id::text || '/%'
);