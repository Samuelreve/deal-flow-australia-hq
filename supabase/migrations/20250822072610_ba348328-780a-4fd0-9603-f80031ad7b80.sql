-- Fix function search path security warnings
-- Setting SECURITY DEFINER functions to have immutable search_path prevents SQL injection attacks

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'seller'
  );
  RETURN NEW;
END;
$function$;

-- Update migrate_temp_documents_to_deal function
CREATE OR REPLACE FUNCTION public.migrate_temp_documents_to_deal(p_temp_deal_id text, p_real_deal_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  temp_file RECORD;
  new_path TEXT;
BEGIN
  -- This function will be called when a deal is finalized to move temp files to the real deal folder
  -- For now, we'll handle this in the application layer
  -- Future implementation could move files in storage and update database records
  NULL;
END;
$function$;

-- Update check_deal_participation function
CREATE OR REPLACE FUNCTION public.check_deal_participation(p_deal_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.deal_participants
    WHERE deal_id = p_deal_id AND user_id = p_user_id
  );
$function$;