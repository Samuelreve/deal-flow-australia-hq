-- Update track_deal_health_changes to include category field
CREATE OR REPLACE FUNCTION public.track_deal_health_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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
      
      -- Create notification with category
      INSERT INTO public.notifications (
        user_id,
        deal_id,
        title,
        message,
        type,
        category,
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
        'deal_update',
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

-- Update update_deal_status to include category field
CREATE OR REPLACE FUNCTION public.update_deal_status(p_deal_id uuid, p_new_status text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id UUID := auth.uid();
  current_user_role TEXT;
  current_deal_status TEXT;
  is_participant BOOLEAN;
  participant_role TEXT;
  result_json JSONB;
BEGIN
  -- 1. Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to update deal status.' USING ERRCODE = '45000';
  END IF;

  -- 2. Check if user is a participant in the deal
  SELECT 
    EXISTS (
      SELECT 1
      FROM deal_participants
      WHERE deal_id = p_deal_id AND user_id = current_user_id
    ),
    dp.role
  INTO is_participant, participant_role
  FROM deal_participants dp
  WHERE dp.deal_id = p_deal_id AND dp.user_id = current_user_id;

  IF NOT is_participant THEN
    RAISE EXCEPTION 'Permission denied: Not a participant in this deal.' USING ERRCODE = '45001';
  END IF;

  -- 3. Get the user's global role from profiles
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = current_user_id;

  IF current_user_role IS NULL THEN
     RAISE EXCEPTION 'Permission denied: User profile or role not found.' USING ERRCODE = '45002';
  END IF;

  -- 4. Get the current deal status
  SELECT status INTO current_deal_status
  FROM deals
  WHERE id = p_deal_id;

  IF current_deal_status IS NULL THEN
     RAISE EXCEPTION 'Deal not found or status missing.' USING ERRCODE = '45003';
  END IF;
  
  -- Don't update if status hasn't changed
  IF current_deal_status = p_new_status::deal_status THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'No change in status',
      'deal_id', p_deal_id,
      'status', current_deal_status
    );
  END IF;

  -- 5. Check if the user's role and the status transition are allowed
  IF participant_role = 'admin' THEN
     NULL;
  ELSIF participant_role = 'seller' THEN
     IF NOT (
       (current_deal_status = 'draft' AND p_new_status IN ('active', 'cancelled')) OR
       (current_deal_status = 'active' AND p_new_status IN ('pending', 'completed', 'cancelled')) OR
       (current_deal_status = 'pending' AND p_new_status IN ('active', 'completed', 'cancelled'))
     ) THEN
       RAISE EXCEPTION 'Permission denied: Invalid status transition for Seller role.' USING ERRCODE = '45004';
     END IF;
  ELSIF participant_role = 'buyer' THEN
     IF NOT (
       (current_deal_status = 'active' AND p_new_status = 'cancelled')
     ) THEN
       RAISE EXCEPTION 'Permission denied: Buyers can only cancel active deals.' USING ERRCODE = '45005';
     END IF;
  ELSE
     RAISE EXCEPTION 'Permission denied: Your role cannot change deal status.' USING ERRCODE = '45006';
  END IF;

  -- 6. If all checks pass, update the deal status
  UPDATE public.deals
  SET 
    status = p_new_status::deal_status,
    updated_at = now()
  WHERE id = p_deal_id;

  -- 7. Create a notification for all participants with category
  INSERT INTO public.notifications (
    user_id,
    deal_id,
    title,
    message,
    type,
    category,
    link
  )
  SELECT 
    dp.user_id,
    p_deal_id,
    'Deal Status Updated',
    'Deal status has been changed from ' || current_deal_status || ' to ' || p_new_status,
    CASE
      WHEN p_new_status = 'completed' THEN 'success'
      WHEN p_new_status = 'cancelled' THEN 'error'
      ELSE 'info'
    END,
    'deal_update',
    '/deals/' || p_deal_id
  FROM deal_participants dp
  WHERE dp.deal_id = p_deal_id;

  -- Return success response
  result_json := jsonb_build_object(
    'success', true,
    'message', 'Deal status updated successfully',
    'deal_id', p_deal_id,
    'old_status', current_deal_status,
    'new_status', p_new_status
  );
  
  RETURN result_json;
END;
$function$;