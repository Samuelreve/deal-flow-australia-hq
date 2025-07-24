-- Enable realtime for milestones table
ALTER PUBLICATION supabase_realtime ADD TABLE public.milestones;

-- Set replica identity for milestones table to capture full row data for realtime
ALTER TABLE public.milestones REPLICA IDENTITY FULL;

-- Enable realtime for documents table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;

-- Set replica identity for documents table
ALTER TABLE public.documents REPLICA IDENTITY FULL;

-- Enable realtime for milestone_assignments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.milestone_assignments;

-- Set replica identity for milestone_assignments table
ALTER TABLE public.milestone_assignments REPLICA IDENTITY FULL;