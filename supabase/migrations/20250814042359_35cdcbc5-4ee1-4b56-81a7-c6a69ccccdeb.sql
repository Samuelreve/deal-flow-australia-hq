-- Add document_comments table to real-time monitoring for Copilot self-learning
ALTER TABLE public.document_comments REPLICA IDENTITY FULL;