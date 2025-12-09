-- Update get_deal_invitations to return invitation_token for pending invitations
CREATE OR REPLACE FUNCTION public.get_deal_invitations(p_deal_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_is_participant BOOLEAN;
  v_result JSONB;
BEGIN
  -- Check if the user is a participant in the deal
  SELECT EXISTS (
    SELECT 1 FROM deal_participants WHERE deal_id = p_deal_id AND user_id = v_user_id
  ) INTO v_user_is_participant;
  
  IF NOT v_user_is_participant THEN
    RETURN jsonb_build_object('success', false, 'message', 'You are not a participant in this deal');
  END IF;

  -- Get all invitations for the deal with token for pending ones
  SELECT jsonb_build_object(
    'success', true,
    'invitations', jsonb_agg(
      jsonb_build_object(
        'id', i.id,
        'email', i.invitee_email,
        'role', i.invitee_role,
        'created_at', i.created_at,
        'status', i.status,
        'token', CASE WHEN i.status = 'pending' THEN i.invitation_token ELSE NULL END,
        'token_expires_at', i.token_expires_at,
        'invited_by', jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'avatar_url', p.avatar_url
        )
      )
    )
  )
  INTO v_result
  FROM deal_invitations i
  LEFT JOIN profiles p ON i.invited_by_user_id = p.id
  WHERE i.deal_id = p_deal_id
  GROUP BY i.deal_id;

  -- Return empty array if no invitations found
  IF v_result IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'invitations', '[]'::jsonb
    );
  END IF;

  RETURN v_result;
END;
$function$;