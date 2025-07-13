-- Fix the document migration issue - move the business document to the correct deal
-- The business document should be in the same deal as the other document

UPDATE public.documents 
SET deal_id = '24ce776b-699b-448f-84c9-75316e976091'
WHERE id = 'd2ef4ae3-7706-46b6-91ea-121c774e43a1'
  AND deal_id = 'e38dd3dd-925f-4d48-8aa7-788ef9cdead7';