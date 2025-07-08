-- Add read_at timestamp to messages table for tracking read status
ALTER TABLE public.messages 
ADD COLUMN read_at timestamp with time zone;

-- Create index for efficient unread message queries
CREATE INDEX idx_messages_read_status ON public.messages(deal_id, recipient_user_id, read_at);

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(p_deal_id uuid, p_recipient_user_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.messages 
  SET read_at = now()
  WHERE deal_id = p_deal_id 
    AND read_at IS NULL
    AND sender_user_id != auth.uid()
    AND (
      (p_recipient_user_id IS NULL AND recipient_user_id IS NULL) OR  -- Deal chat messages
      (p_recipient_user_id IS NOT NULL AND (
        (sender_user_id = p_recipient_user_id AND recipient_user_id = auth.uid()) OR
        (sender_user_id = auth.uid() AND recipient_user_id = p_recipient_user_id)
      ))
    );
END;
$$;