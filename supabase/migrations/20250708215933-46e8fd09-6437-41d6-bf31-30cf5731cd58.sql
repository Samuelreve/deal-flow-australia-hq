-- Fix the Long lawyer data - move from participants to pending invitation
-- First check current state
-- Delete Long (lawyer) from participants table  
DELETE FROM deal_participants 
WHERE deal_id = '0bc503d0-1ce4-4c6a-b193-d085e402e17b' 
AND user_id = 'fd69f452-7995-4fad-93f8-12cda31f111f';

-- Create pending invitation for Long (lawyer)
INSERT INTO deal_invitations (
  deal_id,
  invitee_email,
  invitee_role,
  invited_by_user_id,
  invitation_token,
  status,
  created_at,
  token_expires_at
) VALUES (
  '0bc503d0-1ce4-4c6a-b193-d085e402e17b'::uuid,
  'nd.tri.0310@gmail.com',
  'lawyer'::user_role,
  'e8409885-70b0-4ba0-a6e2-c0cd680500ea'::uuid, -- Long Tran (admin) as inviter
  encode(gen_random_bytes(24), 'hex'), -- Generate new token
  'pending',
  now(),
  now() + interval '7 days'
);