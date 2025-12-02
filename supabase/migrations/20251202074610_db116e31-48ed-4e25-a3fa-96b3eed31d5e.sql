-- Fix final Function Search Path Mutable security warnings
-- Part 4: Last remaining SECURITY DEFINER functions

-- Update mark_messages_as_read function
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(p_deal_id uuid, p_recipient_user_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.messages 
  SET read_at = now()
  WHERE deal_id = p_deal_id 
    AND read_at IS NULL
    AND sender_user_id != auth.uid()
    AND (
      (p_recipient_user_id IS NULL AND recipient_user_id IS NULL) OR
      (p_recipient_user_id IS NOT NULL AND (
        (sender_user_id = p_recipient_user_id AND recipient_user_id = auth.uid()) OR
        (sender_user_id = auth.uid() AND recipient_user_id = p_recipient_user_id)
      ))
    );
END;
$function$;

-- Update save_notification_settings function
CREATE OR REPLACE FUNCTION public.save_notification_settings(p_user_id uuid, p_email_deal_updates boolean, p_email_messages boolean, p_email_document_comments boolean, p_inapp_deal_updates boolean, p_inapp_messages boolean, p_inapp_document_comments boolean)
 RETURNS notification_settings
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result notification_settings;
BEGIN
  INSERT INTO public.notification_settings (
    user_id,
    email_deal_updates,
    email_messages,
    email_document_comments,
    inapp_deal_updates,
    inapp_messages,
    inapp_document_comments
  ) VALUES (
    p_user_id,
    p_email_deal_updates,
    p_email_messages,
    p_email_document_comments,
    p_inapp_deal_updates,
    p_inapp_messages,
    p_inapp_document_comments
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    email_deal_updates = EXCLUDED.email_deal_updates,
    email_messages = EXCLUDED.email_messages,
    email_document_comments = EXCLUDED.email_document_comments,
    inapp_deal_updates = EXCLUDED.inapp_deal_updates,
    inapp_messages = EXCLUDED.inapp_messages,
    inapp_document_comments = EXCLUDED.inapp_document_comments,
    updated_at = now()
  RETURNING * INTO result;
  
  RETURN result;
END;
$function$;

-- Update get_document_comments_with_nested_structure function
CREATE OR REPLACE FUNCTION public.get_document_comments_with_nested_structure(p_document_version_id uuid)
 RETURNS TABLE(id uuid, content text, document_version_id uuid, user_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, page_number integer, location_data jsonb, resolved boolean, parent_comment_id uuid, profiles jsonb, "user" jsonb, replies jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    nc.id,
    nc.content,
    nc.document_version_id,
    nc.user_id,
    nc.created_at,
    nc.updated_at,
    nc.page_number,
    nc.location_data,
    nc.resolved,
    nc.parent_comment_id,
    jsonb_build_object(
      'name', nc.author_name,
      'avatar_url', nc.author_avatar_url
    ) as profiles,
    jsonb_build_object(
      'id', nc.user_id,
      'name', nc.author_name,
      'avatar_url', nc.author_avatar_url
    ) as "user",
    nc.replies
  FROM get_nested_document_comments(p_document_version_id) nc;
END;
$function$;

-- Update update_document_storage_paths function
CREATE OR REPLACE FUNCTION public.update_document_storage_paths(temp_deal_id text, real_deal_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.documents 
  SET 
    deal_id = real_deal_id::uuid,
    storage_path = real_deal_id::text || '/' || 
      CASE 
        WHEN storage_path LIKE '%/%' THEN split_part(storage_path, '/', -1)
        ELSE storage_path
      END
  WHERE deal_id::text = temp_deal_id;
  
  UPDATE public.document_versions
  SET storage_path = real_deal_id::text || '/' || 
    CASE 
      WHEN storage_path LIKE '%/%' THEN split_part(storage_path, '/', -1)
      ELSE storage_path
    END
  WHERE document_id IN (
    SELECT id FROM public.documents WHERE deal_id = real_deal_id::uuid
  );
  
  RAISE NOTICE 'Migrated documents from temp deal % to real deal %', temp_deal_id, real_deal_id;
END;
$function$;