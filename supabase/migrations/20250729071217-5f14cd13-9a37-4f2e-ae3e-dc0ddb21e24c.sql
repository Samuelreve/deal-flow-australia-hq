-- Enable realtime for milestones table
ALTER TABLE public.milestones REPLICA IDENTITY FULL;

-- Add milestones table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.milestones;