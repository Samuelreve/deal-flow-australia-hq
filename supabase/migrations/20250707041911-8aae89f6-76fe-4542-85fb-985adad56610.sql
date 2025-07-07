-- Add text_content column to document_versions table for caching extracted text
ALTER TABLE public.document_versions 
ADD COLUMN text_content TEXT;