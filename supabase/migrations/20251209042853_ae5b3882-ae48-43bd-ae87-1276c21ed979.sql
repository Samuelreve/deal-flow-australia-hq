-- Drop the existing constraint
ALTER TABLE deal_invitations DROP CONSTRAINT IF EXISTS valid_status;

-- Add the new constraint with 'revoked' included
ALTER TABLE deal_invitations ADD CONSTRAINT valid_status 
  CHECK (status = ANY (ARRAY['pending', 'accepted', 'rejected', 'expired', 'revoked']));