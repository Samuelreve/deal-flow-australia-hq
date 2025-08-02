-- Enable real-time for document_comments table
ALTER TABLE public.document_comments REPLICA IDENTITY FULL;

-- Add the document_comments table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_comments;