-- Continue fixing Function Search Path Mutable security warnings
-- Part 3: Final remaining SECURITY DEFINER functions

-- Update get_recovery_plans function
CREATE OR REPLACE FUNCTION public.get_recovery_plans(p_user_id uuid)
 RETURNS SETOF health_recovery_plans
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT * 
  FROM public.health_recovery_plans
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
$function$;

-- Update get_recovery_plans_new function
CREATE OR REPLACE FUNCTION public.get_recovery_plans_new(p_user_id uuid)
 RETURNS SETOF health_recovery_plans_new
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT hrp.* 
  FROM public.health_recovery_plans_new hrp
  JOIN public.deal_participants dp ON hrp.deal_id = dp.deal_id
  WHERE dp.user_id = p_user_id
  ORDER BY hrp.created_at DESC;
$function$;

-- Update get_health_comparisons function
CREATE OR REPLACE FUNCTION public.get_health_comparisons(p_user_id uuid)
 RETURNS SETOF health_score_comparisons
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT * 
  FROM public.health_score_comparisons
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
$function$;

-- Update get_health_reports function
CREATE OR REPLACE FUNCTION public.get_health_reports(p_user_id uuid)
 RETURNS SETOF health_reports
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT * 
  FROM public.health_reports
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
$function$;

-- Update create_custom_metric function
CREATE OR REPLACE FUNCTION public.create_custom_metric(p_deal_id uuid, p_user_id uuid, p_metric_name text, p_metric_weight numeric, p_current_value integer, p_target_value integer, p_is_active boolean)
 RETURNS custom_health_metrics
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_metric public.custom_health_metrics;
BEGIN
  INSERT INTO public.custom_health_metrics (
    deal_id,
    user_id,
    metric_name,
    metric_weight,
    current_value,
    target_value,
    is_active
  ) VALUES (
    p_deal_id,
    p_user_id,
    p_metric_name,
    p_metric_weight,
    p_current_value,
    p_target_value,
    p_is_active
  )
  RETURNING * INTO v_metric;
  
  RETURN v_metric;
END;
$function$;

-- Update is_deal_owner_or_participant function
CREATE OR REPLACE FUNCTION public.is_deal_owner_or_participant(p_deal_id uuid, p_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.deals 
    WHERE id = p_deal_id 
    AND (seller_id = p_user_id OR buyer_id = p_user_id)
  ) OR EXISTS (
    SELECT 1 FROM public.deal_participants 
    WHERE deal_id = p_deal_id 
    AND user_id = p_user_id
  );
$function$;

-- Update is_profile_owner function
CREATE OR REPLACE FUNCTION public.is_profile_owner(profile_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT auth.uid() = profile_id;
$function$;