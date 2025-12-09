-- Create message_reactions table for emoji reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user ON message_reactions(user_id);

-- Enable RLS for message_reactions
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for reactions
CREATE POLICY "Users can view reactions on messages they can see"
  ON message_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = message_reactions.message_id
      AND (
        m.recipient_user_id IS NULL
        OR m.sender_user_id = auth.uid()
        OR m.recipient_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can add reactions"
  ON message_reactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own reactions"
  ON message_reactions FOR DELETE
  USING (user_id = auth.uid());

-- Add indexes for better message query performance
CREATE INDEX IF NOT EXISTS idx_messages_deal_private 
  ON messages(deal_id, recipient_user_id, created_at DESC) 
  WHERE recipient_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_deal_public 
  ON messages(deal_id, created_at DESC) 
  WHERE recipient_user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_unread 
  ON messages(recipient_user_id, read_at) 
  WHERE read_at IS NULL AND recipient_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient
  ON messages(sender_user_id, recipient_user_id, created_at DESC);

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for message attachments
CREATE POLICY "Users can upload message attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'message-attachments'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Anyone can view message attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'message-attachments');

CREATE POLICY "Users can delete their own attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'message-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );