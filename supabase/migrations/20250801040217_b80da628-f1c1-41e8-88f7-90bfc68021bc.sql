-- Enable real-time for documents table to ensure milestone-assigned users get updates
ALTER TABLE public.documents REPLICA IDENTITY FULL;

-- Add documents table to realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'documents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
  END IF;
END $$;