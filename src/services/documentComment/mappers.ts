
import { DocumentComment, DbDocumentComment } from "./types";

/**
 * Maps a database comment structure to our service model
 */
export function mapDbCommentToDocumentComment(dbComment: DbDocumentComment): DocumentComment {
  return {
    id: dbComment.id,
    documentVersionId: dbComment.document_version_id,
    userId: dbComment.user_id,
    content: dbComment.content,
    pageNumber: dbComment.page_number,
    locationData: dbComment.location_data,
    createdAt: new Date(dbComment.created_at),
    updatedAt: new Date(dbComment.updated_at),
    resolved: dbComment.resolved,
    parentCommentId: dbComment.parent_comment_id,
    user: dbComment.profiles ? {
      id: dbComment.profiles.id,
      name: dbComment.profiles.name,
      avatarUrl: dbComment.profiles.avatar_url
    } : undefined,
    replies: []
  };
}

/**
 * Organizes comments into a threaded structure
 */
export function organizeCommentsIntoThreads(comments: DocumentComment[]): DocumentComment[] {
  const threaded: DocumentComment[] = [];
  const commentMap = new Map<string, DocumentComment>();
  
  // First pass: create a map of all comments
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });
  
  // Second pass: organize into threads
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;
    
    if (comment.parentCommentId) {
      // This is a reply, add it to the parent's replies
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        parent.replies!.push(commentWithReplies);
      } else {
        // Parent not found (shouldn't happen with well-formed data)
        threaded.push(commentWithReplies);
      }
    } else {
      // This is a top-level comment
      threaded.push(commentWithReplies);
    }
  });
  
  return threaded.filter(comment => !comment.parentCommentId);
}
