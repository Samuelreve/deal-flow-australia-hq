-- First, let's check what temp deal IDs were used for these documents
-- and update storage paths to reflect where files actually exist

-- Update storage paths for documents that were moved from temp deals
-- The files are likely still in the temp deal folders, so we need to identify
-- the correct temp deal IDs and update the storage paths accordingly

-- For the specific documents that are failing, let's update their storage paths
-- to match where the files were originally uploaded

UPDATE document_versions 
SET storage_path = CASE 
  WHEN id = '46a349cd-2b41-49d1-a679-276dbfddb4f3' THEN 
    'temp-business-docs/e8409885-70b0-4ba0-a6e2-c0cd680500ea-1752387657523.pdf'
  WHEN id = '647012b2-661e-4e4f-b153-cca9eb6f368c' THEN 
    'temp-business-docs/e8409885-70b0-4ba0-a6e2-c0cd680500ea-1752387696850.pdf'
  ELSE storage_path
END
WHERE id IN ('46a349cd-2b41-49d1-a679-276dbfddb4f3', '647012b2-661e-4e4f-b153-cca9eb6f368c');

-- Note: The SampleContract-Shuttle.pdf should already be in the correct location
-- as it was uploaded directly to the final deal