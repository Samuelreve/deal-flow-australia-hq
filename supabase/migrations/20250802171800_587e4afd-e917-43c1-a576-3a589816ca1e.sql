-- Create a simpler, more reliable recursive function for nested comments
CREATE OR REPLACE FUNCTION get_nested_document_comments(p_document_version_id UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  document_version_id UUID,
  user_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  page_number INTEGER,
  location_data JSONB,
  resolved BOOLEAN,
  parent_comment_id UUID,
  author_name TEXT,
  author_avatar_url TEXT,
  replies JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  comment_record RECORD;
  reply_json JSONB;
BEGIN
  -- Get all top-level comments first
  FOR comment_record IN 
    SELECT 
      dc.id,
      dc.content,
      dc.document_version_id,
      dc.user_id,
      dc.created_at,
      dc.updated_at,
      dc.page_number,
      dc.location_data,
      dc.resolved,
      dc.parent_comment_id,
      COALESCE(p.name, 'Unknown User') as author_name,
      p.avatar_url as author_avatar_url
    FROM document_comments dc
    LEFT JOIN profiles p ON dc.user_id = p.id
    WHERE dc.document_version_id = p_document_version_id 
      AND dc.parent_comment_id IS NULL
    ORDER BY dc.created_at ASC
  LOOP
    -- Get all replies for this comment recursively
    SELECT get_comment_replies(comment_record.id) INTO reply_json;
    
    -- Return the comment with its nested replies
    id := comment_record.id;
    content := comment_record.content;
    document_version_id := comment_record.document_version_id;
    user_id := comment_record.user_id;
    created_at := comment_record.created_at;
    updated_at := comment_record.updated_at;
    page_number := comment_record.page_number;
    location_data := comment_record.location_data;
    resolved := comment_record.resolved;
    parent_comment_id := comment_record.parent_comment_id;
    author_name := comment_record.author_name;
    author_avatar_url := comment_record.author_avatar_url;
    replies := reply_json;
    
    RETURN NEXT;
  END LOOP;
END;
$$;

-- Helper function to get replies recursively
CREATE OR REPLACE FUNCTION get_comment_replies(p_parent_comment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reply_record RECORD;
  replies_array JSONB := '[]'::JSONB;
  nested_replies JSONB;
BEGIN
  -- Get all direct replies to this comment
  FOR reply_record IN 
    SELECT 
      dc.id,
      dc.content,
      dc.document_version_id,
      dc.user_id,
      dc.created_at,
      dc.updated_at,
      dc.page_number,
      dc.location_data,
      dc.resolved,
      dc.parent_comment_id,
      COALESCE(p.name, 'Unknown User') as author_name,
      p.avatar_url as author_avatar_url
    FROM document_comments dc
    LEFT JOIN profiles p ON dc.user_id = p.id
    WHERE dc.parent_comment_id = p_parent_comment_id
    ORDER BY dc.created_at ASC
  LOOP
    -- Recursively get replies to this reply
    SELECT get_comment_replies(reply_record.id) INTO nested_replies;
    
    -- Build the reply object with all necessary fields
    replies_array := replies_array || jsonb_build_object(
      'id', reply_record.id,
      'content', reply_record.content,
      'document_version_id', reply_record.document_version_id,
      'user_id', reply_record.user_id,
      'created_at', reply_record.created_at,
      'updated_at', reply_record.updated_at,
      'page_number', reply_record.page_number,
      'location_data', reply_record.location_data,
      'resolved', reply_record.resolved,
      'parent_comment_id', reply_record.parent_comment_id,
      'author_name', reply_record.author_name,
      'author_avatar_url', reply_record.author_avatar_url,
      'user', jsonb_build_object(
        'id', reply_record.user_id,
        'name', reply_record.author_name,
        'avatar_url', reply_record.author_avatar_url
      ),
      'profiles', jsonb_build_object(
        'name', reply_record.author_name,
        'avatar_url', reply_record.author_avatar_url
      ),
      'replies', nested_replies
    );
  END LOOP;
  
  RETURN replies_array;
END;
$$;

-- Grant execute permissions to both functions
GRANT EXECUTE ON FUNCTION get_nested_document_comments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_comment_replies(UUID) TO authenticated;