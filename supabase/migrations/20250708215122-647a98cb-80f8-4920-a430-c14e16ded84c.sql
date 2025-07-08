-- Move Long lawyer back to pending invitation status
-- Create the pending invitation
INSERT INTO deal_invitations (
  deal_id,
  invitee_email,
  invitee_role,
  invited_by_user_id,
  invitation_token,
  status,
  created_at,
  token_expires_at
) 
SELECT 
  '7580d046-3d50-43eb-99de-ce045caa9da6'::uuid,
  p.email,
  'lawyer'::user_role,
  'e8409885-70b0-4ba0-a6e2-c0cd680500ea'::uuid, -- Long Tran (admin) as inviter
  encode(gen_random_bytes(24), 'hex'), -- Generate new token
  'pending',
  now(),
  now() + interval '7 days'
FROM profiles p 
WHERE p.id = 'fd69f452-7995-4fad-93f8-12cda31f111f'; -- Long lawyer's user_id

-- Remove Long lawyer from deal_participants
DELETE FROM deal_participants 
WHERE deal_id = '7580d046-3d50-43eb-99de-ce045caa9da6' 
AND user_id = 'fd69f452-7995-4fad-93f8-12cda31f111f';