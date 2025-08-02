-- Create a function to get nested document comments with full author information
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
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE comment_tree AS (
    -- Base case: get all top-level comments with author info
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
      p.name as author_name,
      p.avatar_url as author_avatar_url,
      '[]'::jsonb as replies,
      0 as level,
      ARRAY[dc.id] as path
    FROM document_comments dc
    LEFT JOIN profiles p ON dc.user_id = p.id
    WHERE dc.document_version_id = p_document_version_id 
      AND dc.parent_comment_id IS NULL
    
    UNION ALL
    
    -- Recursive case: get replies with author info
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
      p.name as author_name,
      p.avatar_url as author_avatar_url,
      '[]'::jsonb as replies,
      ct.level + 1,
      ct.path || dc.id
    FROM document_comments dc
    LEFT JOIN profiles p ON dc.user_id = p.id
    JOIN comment_tree ct ON dc.parent_comment_id = ct.id
    WHERE dc.document_version_id = p_document_version_id
      AND NOT dc.id = ANY(ct.path) -- Prevent infinite loops
  ),
  -- Build the nested structure
  nested_comments AS (
    SELECT 
      ct.*,
      CASE 
        WHEN ct.level = 0 THEN
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', r.id,
                'content', r.content,
                'document_version_id', r.document_version_id,
                'user_id', r.user_id,
                'created_at', r.created_at,
                'updated_at', r.updated_at,
                'page_number', r.page_number,
                'location_data', r.location_data,
                'resolved', r.resolved,
                'parent_comment_id', r.parent_comment_id,
                'author_name', r.author_name,
                'author_avatar_url', r.author_avatar_url,
                'user', jsonb_build_object(
                  'id', r.user_id,
                  'name', r.author_name,
                  'avatar_url', r.author_avatar_url
                ),
                'profiles', jsonb_build_object(
                  'name', r.author_name,
                  'avatar_url', r.author_avatar_url
                )
              ) ORDER BY r.created_at ASC
            )
            FROM comment_tree r 
            WHERE r.parent_comment_id = ct.id
          )
        ELSE '[]'::jsonb
      END as computed_replies
    FROM comment_tree ct
  )
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
    nc.author_name,
    nc.author_avatar_url,
    COALESCE(nc.computed_replies, '[]'::jsonb) as replies
  FROM nested_comments nc
  WHERE nc.level = 0  -- Only return top-level comments
  ORDER BY nc.created_at ASC;
END;
$$;

-- Create an enhanced function that returns comments in the expected frontend format
CREATE OR REPLACE FUNCTION get_document_comments_with_nested_structure(p_document_version_id UUID)
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
  profiles JSONB,
  "user" JSONB,
  replies JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_nested_document_comments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_document_comments_with_nested_structure(UUID) TO authenticated;