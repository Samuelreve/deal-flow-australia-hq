-- Create function to update document storage paths during migration
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
    storage_path = REPLACE(storage_path, temp_deal_id, real_deal_id::text)
  WHERE deal_id::text = temp_deal_id;
  
  -- Update document_versions table 
  UPDATE public.document_versions
  SET storage_path = REPLACE(storage_path, temp_deal_id, real_deal_id::text)
  WHERE document_id IN (
    SELECT id FROM public.documents WHERE deal_id = real_deal_id::uuid
  );
END;
$$;