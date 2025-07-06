CREATE OR REPLACE FUNCTION public.calculate_deal_health_score()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  total_milestones INT;
  completed_milestones INT;
  blocked_milestones INT;
  in_progress_milestones INT;
  calculated_health_score INT;  -- Changed variable name to avoid ambiguity
BEGIN
  -- Get counts for the deal's milestones
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
  
  -- Calculate health score:
  -- 100% if all milestones completed
  -- 0% if all milestones blocked
  -- Otherwise, weighted calculation based on progress
  IF total_milestones = 0 THEN
    calculated_health_score := 50; -- Default value for a deal with no milestones
  ELSIF total_milestones = completed_milestones THEN
    calculated_health_score := 100; -- All milestones completed
  ELSE
    -- Base score: percentage of completed milestones
    calculated_health_score := (completed_milestones::FLOAT / total_milestones::FLOAT * 70)::INT;
    
    -- Add points for in-progress milestones (up to 20%)
    calculated_health_score := calculated_health_score + 
                   (in_progress_milestones::FLOAT / total_milestones::FLOAT * 20)::INT;
    
    -- Subtract points for blocked milestones (up to 30%)
    calculated_health_score := calculated_health_score - 
                   (blocked_milestones::FLOAT / total_milestones::FLOAT * 30)::INT;
                   
    -- Ensure the score is between 0 and 100
    calculated_health_score := GREATEST(0, LEAST(100, calculated_health_score));
  END IF;
  
  -- Update the deal's health score
  UPDATE public.deals
  SET health_score = calculated_health_score,  -- Now uses the variable clearly
      updated_at = NOW()
  WHERE id = NEW.deal_id;
  
  RETURN NEW;
END;
$function$;