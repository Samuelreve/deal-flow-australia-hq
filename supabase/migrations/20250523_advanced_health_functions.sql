
-- Create functions to support advanced health monitoring

-- Function to get custom health metrics
CREATE OR REPLACE FUNCTION public.get_custom_health_metrics(p_user_id UUID)
RETURNS SETOF public.custom_health_metrics
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * 
  FROM public.custom_health_metrics
  WHERE user_id = p_user_id AND is_active = true
  ORDER BY created_at DESC;
$$;

-- Function to get health recovery plans
CREATE OR REPLACE FUNCTION public.get_recovery_plans(p_user_id UUID)
RETURNS SETOF public.health_recovery_plans
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * 
  FROM public.health_recovery_plans
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
$$;

-- Function to get health score comparisons
CREATE OR REPLACE FUNCTION public.get_health_comparisons(p_user_id UUID)
RETURNS SETOF public.health_score_comparisons
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * 
  FROM public.health_score_comparisons
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
$$;

-- Function to get health reports
CREATE OR REPLACE FUNCTION public.get_health_reports(p_user_id UUID)
RETURNS SETOF public.health_reports
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * 
  FROM public.health_reports
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
$$;

-- Function to create custom metric
CREATE OR REPLACE FUNCTION public.create_custom_metric(
  p_deal_id UUID,
  p_user_id UUID,
  p_metric_name TEXT,
  p_metric_weight DECIMAL,
  p_current_value INTEGER,
  p_target_value INTEGER,
  p_is_active BOOLEAN
)
RETURNS public.custom_health_metrics
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
