
import { DocumentComment } from "@/services/documentCommentService";

/**
 * Get comment count for a version
 */
export function getCommentCount(comments: DocumentComment[]): number {
  return comments.length;
}
