-- Enable REPLICA IDENTITY FULL for complete row data in realtime events
ALTER TABLE message_reactions REPLICA IDENTITY FULL;

-- Add table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;