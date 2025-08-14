-- Enable real-time updates for Copilot self-learning
-- Set replica identity to full for tables (required for real-time monitoring)
ALTER TABLE public.deals REPLICA IDENTITY FULL;
ALTER TABLE public.deal_participants REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;