-- Enable realtime for documents table
ALTER TABLE public.documents REPLICA IDENTITY FULL;

-- Add documents table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;