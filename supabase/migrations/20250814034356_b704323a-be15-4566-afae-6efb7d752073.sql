-- Enable real-time updates for Copilot self-learning (only add missing tables)
-- Set replica identity to full for tables we want to monitor
ALTER TABLE public.deals REPLICA IDENTITY FULL;
ALTER TABLE public.milestones REPLICA IDENTITY FULL;
ALTER TABLE public.deal_participants REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;

-- Add tables to realtime publication for live updates (skip documents as it's already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;