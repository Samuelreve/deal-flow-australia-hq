-- Add recipient_user_id to messages table to support private messaging
ALTER TABLE public.messages 
ADD COLUMN recipient_user_id uuid REFERENCES auth.users(id);

-- Update RLS policies to support private messages
DROP POLICY IF EXISTS "Users can view messages for their deals" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages for their deals" ON public.messages;
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;

-- New policy for viewing messages: either deal-wide messages (no recipient) or private messages where user is sender/recipient
CREATE POLICY "Users can view deal and private messages" 
ON public.messages 
FOR SELECT 
USING (
  is_deal_participant_or_role(deal_id) AND 
  (
    recipient_user_id IS NULL OR  -- Deal-wide messages
    auth.uid() = sender_user_id OR  -- User sent the message
    auth.uid() = recipient_user_id  -- User is the recipient
  )
);

-- New policy for inserting messages
CREATE POLICY "Users can send deal and private messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_user_id AND 
  is_deal_participant_or_role(deal_id) AND
  (
    recipient_user_id IS NULL OR  -- Deal-wide messages
    is_deal_participant_or_role(deal_id, recipient_user_id)  -- Recipient is also a participant
  )
);

-- Update policy for updating messages
CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = sender_user_id);

-- Update policy for deleting messages  
CREATE POLICY "Users can delete their own messages" 
ON public.messages 
FOR DELETE 
USING (auth.uid() = sender_user_id);