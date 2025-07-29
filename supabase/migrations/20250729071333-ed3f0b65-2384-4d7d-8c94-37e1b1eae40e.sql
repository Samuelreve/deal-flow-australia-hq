-- Enable realtime for milestones table
ALTER TABLE public.milestones REPLICA IDENTITY FULL;