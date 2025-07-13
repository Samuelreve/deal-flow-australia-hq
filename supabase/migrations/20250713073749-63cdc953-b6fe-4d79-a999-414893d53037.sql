-- Fix the existing document storage path that has the issue
UPDATE public.documents 
SET storage_path = deal_id::text || '/' || 
  CASE 
    WHEN storage_path LIKE '%/%' THEN split_part(storage_path, '/', -1)
    ELSE storage_path
  END
WHERE storage_path NOT LIKE deal_id::text || '/%' 
  AND storage_path != '';

-- Also fix the document versions
UPDATE public.document_versions dv
SET storage_path = d.deal_id::text || '/' || 
  CASE 
    WHEN dv.storage_path LIKE '%/%' THEN split_part(dv.storage_path, '/', -1)
    ELSE dv.storage_path
  END
FROM public.documents d
WHERE dv.document_id = d.id
  AND dv.storage_path NOT LIKE d.deal_id::text || '/%'
  AND dv.storage_path != '';