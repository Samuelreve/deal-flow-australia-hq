-- Continue fixing Function Search Path Mutable security warnings
-- Part 2: Add SET search_path TO 'public' to remaining SECURITY DEFINER functions

-- Update get_allowed_status_transitions function
CREATE OR REPLACE FUNCTION public.get_allowed_status_transitions(p_current_status deal_status, p_deal_category deal_category, p_user_role user_role)
 RETURNS text[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  allowed_statuses text[] := '{}';
BEGIN
  CASE p_current_status::text
    WHEN 'draft' THEN
      allowed_statuses := ARRAY['active', 'cancelled'];
    WHEN 'active' THEN
      allowed_statuses := ARRAY['due_diligence', 'cancelled'];
    WHEN 'due_diligence' THEN
      allowed_statuses := ARRAY['contract_negotiation', 'active', 'cancelled'];
    WHEN 'contract_negotiation' THEN
      CASE p_deal_category
        WHEN 'real_estate' THEN
          allowed_statuses := ARRAY['settlement', 'due_diligence', 'cancelled'];
        WHEN 'ip_transfer' THEN
          allowed_statuses := ARRAY['ip_transfer_pending', 'due_diligence', 'cancelled'];
        WHEN 'cross_border' THEN
          allowed_statuses := ARRAY['regulatory_approval', 'due_diligence', 'cancelled'];
        ELSE
          allowed_statuses := ARRAY['pending', 'due_diligence', 'cancelled'];
      END CASE;
    WHEN 'settlement', 'ip_transfer_pending', 'regulatory_approval', 'pending' THEN
      allowed_statuses := ARRAY['completed', 'contract_negotiation', 'cancelled'];
    ELSE
      allowed_statuses := '{}';
  END CASE;
  
  IF p_user_role != 'admin' AND p_user_role != 'seller' THEN
    allowed_statuses := ARRAY(SELECT unnest(allowed_statuses) WHERE unnest(allowed_statuses) IN ('cancelled'));
  END IF;
  
  RETURN allowed_statuses;
END;
$function$;

-- Update get_auth_user_role function
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role::TEXT FROM public.profiles WHERE id = auth.uid();
$function$;

-- Update get_current_user_role function (already has search_path but redeclare for completeness)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$function$;

-- Update get_custom_health_metrics function
CREATE OR REPLACE FUNCTION public.get_custom_health_metrics(p_user_id uuid)
 RETURNS SETOF custom_health_metrics
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT * 
  FROM public.custom_health_metrics
  WHERE user_id = p_user_id AND is_active = true
  ORDER BY created_at DESC;
$function$;

-- Update get_custom_metrics_new function
CREATE OR REPLACE FUNCTION public.get_custom_metrics_new(p_user_id uuid)
 RETURNS SETOF custom_health_metrics_new
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT chm.* 
  FROM public.custom_health_metrics_new chm
  JOIN public.deal_participants dp ON chm.deal_id = dp.deal_id
  WHERE dp.user_id = p_user_id AND chm.is_active = true
  ORDER BY chm.created_at DESC;
$function$;

-- Update get_health_predictions_new function
CREATE OR REPLACE FUNCTION public.get_health_predictions_new(p_user_id uuid)
 RETURNS SETOF deal_health_predictions_new
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT dhp.* 
  FROM public.deal_health_predictions_new dhp
  JOIN public.deal_participants dp ON dhp.deal_id = dp.deal_id
  WHERE dp.user_id = p_user_id
  ORDER BY dhp.created_at DESC;
$function$;