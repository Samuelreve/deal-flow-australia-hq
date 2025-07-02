-- Add token expiration column to deal_invitations table
ALTER TABLE public.deal_invitations
ADD COLUMN token_expires_at TIMESTAMP WITH TIME ZONE
DEFAULT (now() + interval '7 days');

-- Update existing records to have expiration dates
UPDATE public.deal_invitations 
SET token_expires_at = created_at + interval '7 days' 
WHERE token_expires_at IS NULL;