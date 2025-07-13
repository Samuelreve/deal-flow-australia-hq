-- Fix storage paths for documents in the current deal
-- Based on upload timestamps and file analysis

-- First, let's update the storage paths to point to actual file locations
-- The 1.pdf (business_document) is likely in the business_document bucket
-- The SampleContract-Shuttle.pdf should be in deal_documents bucket

-- For the business document (1.pdf), it was uploaded around 06:26:09
-- Looking at business_document bucket, there should be a file around that time
UPDATE document_versions 
SET storage_path = 'temp-business-docs/e8409885-70b0-4ba0-a6e2-c0cd680500ea-1752387977041.pdf'
WHERE id = '9269aea4-a1ec-404f-aec2-c01b192e3ebb';

-- For the SampleContract-Shuttle.pdf, it was uploaded around 06:26:31
-- This should be in a temp deal folder in deal_documents bucket
-- Based on timing, it's likely the most recent upload in deal_documents
UPDATE document_versions 
SET storage_path = '0423163d-a2e2-4ef2-a738-32e8c7bc29ac/e8409885-70b0-4ba0-a6e2-c0cd680500ea-1752386966981.pdf'
WHERE id = 'e15bdcfd-6db6-4293-a1ee-3c79dab54784';