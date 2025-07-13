-- Fix the document migration issue by updating the business document that was left behind
-- The document with ID 69bec2f1-4f68-4428-a63a-bf94b7c3f9cf needs to be migrated to the final deal

UPDATE public.documents 
SET deal_id = '0bcb3cfd-f766-4dc6-a1c9-2c5e37b62be7'
WHERE id = '69bec2f1-4f68-4428-a63a-bf94b7c3f9cf'
  AND deal_id = '248699c8-b54b-439d-90c0-b764f9ebf5b0';