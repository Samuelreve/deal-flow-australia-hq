-- Fix the category for business documents that were incorrectly categorized as 'Other'
-- Update documents that should be business_document based on their upload context

UPDATE public.documents 
SET category = 'business_document'
WHERE category = 'Other' 
  AND name IN ('1.docx', '1.pdf')
  AND deal_id = 'a62607f6-71b4-4e09-80ad-abdb8a8493e9';