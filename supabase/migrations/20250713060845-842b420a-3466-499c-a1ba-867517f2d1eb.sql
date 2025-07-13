-- Fix the document that was left in the temp deal from step 1
-- Update the business document that should be in the final deal
UPDATE public.documents 
SET deal_id = 'a5c1294a-1803-4348-95c8-6e651fe4f73d'
WHERE deal_id = '9033121b-f11f-4407-a88f-2559a9cac401'
  AND name = '1.pdf'
  AND category = 'business_document';