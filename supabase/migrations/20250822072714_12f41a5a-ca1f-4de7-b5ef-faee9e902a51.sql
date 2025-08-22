-- Fix remaining function search path security warnings - Batch 1
-- These are the most critical functions that need secure search_path

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update track_deal_health_changes function  
CREATE OR REPLACE FUNCTION public.track_deal_health_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  old_score INTEGER;
  new_score INTEGER;
  participant_record RECORD;
  threshold_record RECORD;
  alert_message TEXT;
  recommendations JSONB DEFAULT '[]'::jsonb;
BEGIN
  -- Get old and new health scores
  old_score := COALESCE(OLD.health_score, 0);
  new_score := NEW.health_score;
  
  -- Only proceed if health score actually changed
  IF old_score = new_score THEN
    RETURN NEW;
  END IF;
  
  -- Insert into health history
  INSERT INTO public.deal_health_history (
    deal_id, 
    health_score, 
    previous_score, 
    change_reason
  ) VALUES (
    NEW.id, 
    new_score, 
    old_score, 
    'Milestone progress update'
  );
  
  -- Check thresholds and create alerts for all participants
  FOR participant_record IN 
    SELECT dp.user_id 
    FROM public.deal_participants dp 
    WHERE dp.deal_id = NEW.id
  LOOP
    -- Check if any thresholds are breached
    FOR threshold_record IN
      SELECT * FROM public.deal_health_thresholds 
      WHERE deal_id = NEW.id 
      AND user_id = participant_record.user_id 
      AND is_enabled = true
      AND new_score <= threshold_value
      AND old_score > threshold_value
    LOOP
      -- Create threshold breach alert
      CASE threshold_record.threshold_type
        WHEN 'critical' THEN 
          alert_message := 'Critical: Deal health has dropped to ' || new_score || '% (below ' || threshold_record.threshold_value || '% threshold)';
          recommendations := '[{"area": "Immediate Action", "recommendation": "Review blocked milestones and resolve issues", "impact": "high"}, {"area": "Communication", "recommendation": "Schedule urgent team meeting", "impact": "high"}]'::jsonb;
        WHEN 'warning' THEN 
          alert_message := 'Warning: Deal health has declined to ' || new_score || '% (below ' || threshold_record.threshold_value || '% threshold)';
          recommendations := '[{"area": "Process Review", "recommendation": "Review milestone progress and dependencies", "impact": "medium"}, {"area": "Resource Allocation", "recommendation": "Consider additional resources for delayed tasks", "impact": "medium"}]'::jsonb;
        WHEN 'info' THEN 
          alert_message := 'Notice: Deal health is now ' || new_score || '% (below ' || threshold_record.threshold_value || '% threshold)';
          recommendations := '[{"area": "Monitoring", "recommendation": "Continue monitoring progress closely", "impact": "low"}]'::jsonb;
      END CASE;
      
      INSERT INTO public.deal_health_alerts (
        deal_id,
        user_id,
        alert_type,
        threshold_value,
        current_score,
        previous_score,
        message,
        recommendations
      ) VALUES (
        NEW.id,
        participant_record.user_id,
        'threshold_breach',
        threshold_record.threshold_value,
        new_score,
        old_score,
        alert_message,
        recommendations
      );
      
      -- Create notification
      INSERT INTO public.notifications (
        user_id,
        deal_id,
        title,
        message,
        type,
        link
      ) VALUES (
        participant_record.user_id,
        NEW.id,
        'Deal Health Alert',
        alert_message,
        CASE threshold_record.threshold_type
          WHEN 'critical' THEN 'error'
          WHEN 'warning' THEN 'warning'
          ELSE 'info'
        END,
        '/deals/' || NEW.id
      );
    END LOOP;
    
    -- Create general score drop alert for significant changes (>10 points)
    IF new_score < old_score AND (old_score - new_score) >= 10 THEN
      INSERT INTO public.deal_health_alerts (
        deal_id,
        user_id,
        alert_type,
        current_score,
        previous_score,
        message,
        recommendations
      ) VALUES (
        NEW.id,
        participant_record.user_id,
        'score_drop',
        new_score,
        old_score,
        'Deal health dropped significantly from ' || old_score || '% to ' || new_score || '%',
        '[{"area": "Investigation", "recommendation": "Identify root causes of health decline", "impact": "medium"}, {"area": "Corrective Action", "recommendation": "Develop action plan to address issues", "impact": "high"}]'::jsonb
      );
    END IF;
    
    -- Create improvement alert for significant improvements (>15 points)
    IF new_score > old_score AND (new_score - old_score) >= 15 THEN
      INSERT INTO public.deal_health_alerts (
        deal_id,
        user_id,
        alert_type,
        current_score,
        previous_score,
        message,
        recommendations
      ) VALUES (
        NEW.id,
        participant_record.user_id,
        'improvement',
        new_score,
        old_score,
        'Great progress! Deal health improved from ' || old_score || '% to ' || new_score || '%',
        '[{"area": "Momentum", "recommendation": "Maintain current pace and processes", "impact": "medium"}]'::jsonb
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$function$;