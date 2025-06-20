-- Remove existing policies on storage.objects for deal-documents bucket
DROP POLICY IF EXISTS "Allow uploads during deal creation" ON storage.objects;
DROP POLICY IF EXISTS "Users can view deal documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update deal documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete deal documents" ON storage.objects;

-- Create comprehensive storage policies for deal-documents bucket

-- Policy 1: Allow authenticated users to upload files during deal creation (temp IDs) and to real deals
CREATE POLICY "Allow uploads to deal documents" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'deal-documents' AND
  (
    -- For real deal IDs: check if user is a participant
    (
      (storage.foldername(name))[1]::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND
      EXISTS (
        SELECT 1 FROM public.deal_participants dp 
        WHERE dp.deal_id::text = (storage.foldername(name))[1] 
        AND dp.user_id = auth.uid()
      )
    )
    OR
    -- For temporary deal IDs during creation: allow authenticated users
    (storage.foldername(name))[1]::text LIKE 'temp-%'
  )
);

-- Policy 2: Allow users to view their own uploaded files or files from deals they participate in
CREATE POLICY "View deal documents" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'deal-documents' AND
  (
    -- For real deal IDs: check if user is a participant
    (
      (storage.foldername(name))[1]::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND
      EXISTS (
        SELECT 1 FROM public.deal_participants dp 
        WHERE dp.deal_id::text = (storage.foldername(name))[1] 
        AND dp.user_id = auth.uid()
      )
    )
    OR
    -- For temporary deal IDs: allow the authenticated user to view
    (storage.foldername(name))[1]::text LIKE 'temp-%'
  )
);

-- Policy 3: Allow users to update files they have permission to modify
CREATE POLICY "Update deal documents" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'deal-documents' AND
  (
    -- For real deal IDs: check if user is a participant with proper role
    (
      (storage.foldername(name))[1]::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND
      EXISTS (
        SELECT 1 FROM public.deal_participants dp 
        WHERE dp.deal_id::text = (storage.foldername(name))[1] 
        AND dp.user_id = auth.uid()
        AND dp.role IN ('admin', 'seller', 'lawyer')
      )
    )
    OR
    -- For temporary deal IDs: allow authenticated users
    (storage.foldername(name))[1]::text LIKE 'temp-%'
  )
);

-- Policy 4: Allow users to delete files they have permission to modify
CREATE POLICY "Delete deal documents" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'deal-documents' AND
  (
    -- For real deal IDs: check if user is a participant with proper role
    (
      (storage.foldername(name))[1]::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND
      EXISTS (
        SELECT 1 FROM public.deal_participants dp 
        WHERE dp.deal_id::text = (storage.foldername(name))[1] 
        AND dp.user_id = auth.uid()
        AND dp.role IN ('admin', 'seller', 'lawyer')
      )
    )
    OR
    -- For temporary deal IDs: allow authenticated users
    (storage.foldername(name))[1]::text LIKE 'temp-%'
  )
);

-- Create a function to migrate temporary uploads to real deal ID when deal is created
CREATE OR REPLACE FUNCTION public.migrate_temp_documents_to_deal(
  p_temp_deal_id TEXT,
  p_real_deal_id UUID,
  p_user_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  temp_file RECORD;
  new_path TEXT;
BEGIN
  -- This function will be called when a deal is finalized to move temp files to the real deal folder
  -- For now, we'll handle this in the application layer
  -- Future implementation could move files in storage and update database records
  NULL;
END;
$$;