-- Fix Function Search Path Mutable security warning
-- Add SET search_path TO 'public' to all SECURITY DEFINER functions that don't have it

-- Update is_deal_participant_or_role function
CREATE OR REPLACE FUNCTION public.is_deal_participant_or_role(p_deal_id uuid, p_required_role text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id UUID := auth.uid();
  user_is_participant BOOLEAN := FALSE;
  user_role TEXT;
BEGIN
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.deal_participants
    WHERE deal_id = p_deal_id AND user_id = current_user_id
  ) INTO user_is_participant;

  IF NOT user_is_participant THEN
      RETURN FALSE;
  END IF;

  IF p_required_role IS NOT NULL THEN
    SELECT role INTO user_role FROM public.profiles WHERE id = current_user_id;
    RETURN user_role = p_required_role;
  END IF;

  RETURN TRUE;
END;
$function$;

-- Update calculate_deal_health_score function
CREATE OR REPLACE FUNCTION public.calculate_deal_health_score()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  total_milestones INT;
  completed_milestones INT;
  blocked_milestones INT;
  in_progress_milestones INT;
  calculated_health_score INT;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'blocked'),
    COUNT(*) FILTER (WHERE status = 'in_progress')
  INTO 
    total_milestones,
    completed_milestones,
    blocked_milestones,
    in_progress_milestones
  FROM public.milestones
  WHERE deal_id = NEW.deal_id;
  
  IF total_milestones = 0 THEN
    calculated_health_score := 50;
  ELSIF total_milestones = completed_milestones THEN
    calculated_health_score := 100;
  ELSE
    calculated_health_score := (completed_milestones::FLOAT / total_milestones::FLOAT * 70)::INT;
    calculated_health_score := calculated_health_score + 
                   (in_progress_milestones::FLOAT / total_milestones::FLOAT * 20)::INT;
    calculated_health_score := calculated_health_score - 
                   (blocked_milestones::FLOAT / total_milestones::FLOAT * 30)::INT;
    calculated_health_score := GREATEST(0, LEAST(100, calculated_health_score));
  END IF;
  
  UPDATE public.deals
  SET health_score = calculated_health_score,
      updated_at = NOW()
  WHERE id = NEW.deal_id;
  
  RETURN NEW;
END;
$function$;

-- Update create_default_health_thresholds function
CREATE OR REPLACE FUNCTION public.create_default_health_thresholds()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  participant_record RECORD;
BEGIN
  FOR participant_record IN 
    SELECT dp.user_id 
    FROM public.deal_participants dp 
    WHERE dp.deal_id = NEW.deal_id
  LOOP
    INSERT INTO public.deal_health_thresholds (
      deal_id, 
      user_id, 
      threshold_type, 
      threshold_value
    ) VALUES 
    (NEW.deal_id, participant_record.user_id, 'critical', 30),
    (NEW.deal_id, participant_record.user_id, 'warning', 50),
    (NEW.deal_id, participant_record.user_id, 'info', 70);
  END LOOP;
  
  RETURN NEW;
END;
$function$;