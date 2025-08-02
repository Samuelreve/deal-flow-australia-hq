-- Update the database function to properly handle deep nesting
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
    
    -- Recursive case: get all replies at any level with author info
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
  -- Function to build nested structure recursively
  build_nested_comments AS (
    WITH RECURSIVE nested AS (
      -- Start with the deepest level comments (those with no children)
      SELECT 
        ct.id,
        ct.content,
        ct.document_version_id,
        ct.user_id,
        ct.created_at,
        ct.updated_at,
        ct.page_number,
        ct.location_data,
        ct.resolved,
        ct.parent_comment_id,
        ct.author_name,
        ct.author_avatar_url,
        ct.level,
        CASE 
          WHEN NOT EXISTS (
            SELECT 1 FROM comment_tree child 
            WHERE child.parent_comment_id = ct.id
          ) THEN '[]'::jsonb
          ELSE NULL
        END as computed_replies
      FROM comment_tree ct
      
      UNION ALL
      
      -- Build up the tree by adding children to parents
      SELECT 
        parent.id,
        parent.content,
        parent.document_version_id,
        parent.user_id,
        parent.created_at,
        parent.updated_at,
        parent.page_number,
        parent.location_data,
        parent.resolved,
        parent.parent_comment_id,
        parent.author_name,
        parent.author_avatar_url,
        parent.level,
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', child.id,
              'content', child.content,
              'document_version_id', child.document_version_id,
              'user_id', child.user_id,
              'created_at', child.created_at,
              'updated_at', child.updated_at,
              'page_number', child.page_number,
              'location_data', child.location_data,
              'resolved', child.resolved,
              'parent_comment_id', child.parent_comment_id,
              'author_name', child.author_name,
              'author_avatar_url', child.author_avatar_url,
              'user', jsonb_build_object(
                'id', child.user_id,
                'name', child.author_name,
                'avatar_url', child.author_avatar_url
              ),
              'profiles', jsonb_build_object(
                'name', child.author_name,
                'avatar_url', child.author_avatar_url
              ),
              'replies', COALESCE(child.computed_replies, '[]'::jsonb)
            ) ORDER BY child.created_at ASC
          )
          FROM nested child 
          WHERE child.parent_comment_id = parent.id
            AND child.computed_replies IS NOT NULL
        ) as computed_replies
      FROM comment_tree parent
      WHERE parent.level < (SELECT MAX(level) FROM comment_tree)
        AND EXISTS (
          SELECT 1 FROM nested child 
          WHERE child.parent_comment_id = parent.id
            AND child.computed_replies IS NOT NULL
        )
    )
    SELECT * FROM nested WHERE computed_replies IS NOT NULL
  )
  SELECT 
    bnc.id,
    bnc.content,
    bnc.document_version_id,
    bnc.user_id,
    bnc.created_at,
    bnc.updated_at,
    bnc.page_number,
    bnc.location_data,
    bnc.resolved,
    bnc.parent_comment_id,
    bnc.author_name,
    bnc.author_avatar_url,
    COALESCE(bnc.computed_replies, '[]'::jsonb) as replies
  FROM build_nested_comments bnc
  WHERE bnc.level = 0  -- Only return top-level comments
  ORDER BY bnc.created_at ASC;
END;
$$;