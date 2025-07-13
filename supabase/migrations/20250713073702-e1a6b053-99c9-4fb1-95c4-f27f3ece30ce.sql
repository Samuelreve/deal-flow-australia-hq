-- Update the migration function to properly handle storage paths
CREATE OR REPLACE FUNCTION public.update_document_storage_paths(
  temp_deal_id TEXT,
  real_deal_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update documents table
  UPDATE public.documents 
  SET 
    deal_id = real_deal_id::uuid,
    storage_path = real_deal_id::text || '/' || 
      CASE 
        WHEN storage_path LIKE '%/%' THEN split_part(storage_path, '/', -1)
        ELSE storage_path
      END
  WHERE deal_id::text = temp_deal_id;
  
  -- Update document_versions table 
  UPDATE public.document_versions
  SET storage_path = real_deal_id::text || '/' || 
    CASE 
      WHEN storage_path LIKE '%/%' THEN split_part(storage_path, '/', -1)
      ELSE storage_path
    END
  WHERE document_id IN (
    SELECT id FROM public.documents WHERE deal_id = real_deal_id::uuid
  );
  
  -- Log the migration
  RAISE NOTICE 'Migrated documents from temp deal % to real deal %', temp_deal_id, real_deal_id;
END;
$$;