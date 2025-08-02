-- Enable real-time for deal_participants table
ALTER TABLE public.deal_participants REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.deal_participants;

-- Enable real-time for deal_invitations table  
ALTER TABLE public.deal_invitations REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.deal_invitations;