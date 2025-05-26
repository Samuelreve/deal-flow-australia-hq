
import { DbDocumentComment, DocumentComment } from "./types";

export const mapDbCommentToServiceComment = (dbComment: DbDocumentComment): DocumentComment => {
  return {
    id: dbComment.id,
    content: dbComment.content,
    document_version_id: dbComment.document_version_id,
    user_id: dbComment.user_id,
    created_at: dbComment.created_at,
    updated_at: dbComment.updated_at,
    page_number: dbComment.page_number,
    location_data: dbComment.location_data,
    resolved: dbComment.resolved,
    parent_comment_id: dbComment.parent_comment_id,
    user: {
      id: dbComment.user_id,
      name: dbComment.profiles?.name || 'Unknown User',
      avatar_url: dbComment.profiles?.avatar_url || undefined,
    },
    replies: []
  };
};
