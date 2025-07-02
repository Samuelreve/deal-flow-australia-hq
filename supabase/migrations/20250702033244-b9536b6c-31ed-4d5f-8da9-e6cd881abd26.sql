-- Create audit_log table for tracking invitation events
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_log table
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit_log access
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

-- Enhanced accept_invitation function with improvements
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token text, p_user_id uuid)
 RETURNS TABLE(success boolean, deal_id uuid, invitee_role user_role, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_invitation_id UUID;
  v_deal_id UUID;
  v_invitee_role user_role;
  v_invited_by_user_id UUID;
  v_token_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the invitation details
  SELECT 
    id, 
    deal_invitations.deal_id, 
    invitee_role,
    invited_by_user_id,
    token_expires_at
  INTO 
    v_invitation_id,
    v_deal_id,
    v_invitee_role,
    v_invited_by_user_id,
    v_token_expires_at
  FROM deal_invitations
  WHERE invitation_token = p_token AND status = 'pending';
  
  -- Check if invitation exists and is pending
  IF v_invitation_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or already used invitation token' USING ERRCODE = '22000';
  END IF;
  
  -- Check if token has expired
  IF v_token_expires_at IS NOT NULL AND v_token_expires_at < now() THEN
    RAISE EXCEPTION 'Invitation token has expired' USING ERRCODE = '22007';
  END IF;
  
  -- Start transaction to update invitation and create participant
  BEGIN
    -- Add user as a participant
    INSERT INTO deal_participants (
      deal_id,
      user_id,
      role
    ) VALUES (
      v_deal_id,
      p_user_id,
      v_invitee_role
    );
    
    -- Mark invitation as accepted
    UPDATE deal_invitations
    SET 
      status = 'accepted',
      accepted_by_user_id = p_user_id,
      accepted_at = now()
    WHERE id = v_invitation_id;
    
    -- Audit logging
    INSERT INTO audit_log (user_id, event, metadata)
    VALUES (
      p_user_id, 
      'invitation_accepted', 
      jsonb_build_object(
        'deal_id', v_deal_id,
        'invitation_id', v_invitation_id,
        'invitee_role', v_invitee_role,
        'invited_by_user_id', v_invited_by_user_id
      )
    );
    
    -- Return success with metadata
    RETURN QUERY SELECT true, v_deal_id, v_invitee_role, 'Invitation accepted successfully'::text;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE;
  END;
END;
$function$;