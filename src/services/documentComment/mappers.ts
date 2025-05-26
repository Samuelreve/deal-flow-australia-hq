
import { DocumentComment as DbDocumentComment } from '@/types/documentComment';
import { DocumentComment as ServiceDocumentComment } from './types';

/**
 * Maps a DB document comment to a service document comment
 */
export const mapDbCommentToServiceComment = (dbComment: DbDocumentComment): ServiceDocumentComment => {
  return {
    id: dbComment.id,
    documentVersionId: dbComment.document_version_id,
    userId: dbComment.user_id,
    content: dbComment.content,
    pageNumber: dbComment.page_number || undefined,
    locationData: dbComment.location_data,
    createdAt: new Date(dbComment.created_at),
    updatedAt: new Date(dbComment.updated_at),
    resolved: dbComment.resolved,
    parentCommentId: dbComment.parent_comment_id || undefined,
    user: dbComment.user ? {
      id: dbComment.user.id,
      name: dbComment.user.name,
      avatarUrl: dbComment.user.avatar_url
    } : undefined,
    replies: dbComment.replies ? dbComment.replies.map(mapDbCommentToServiceComment) : undefined
  };
};

/**
 * Maps a service document comment to a DB document comment
 */
export const mapServiceCommentToDbComment = (serviceComment: ServiceDocumentComment): DbDocumentComment => {
  return {
    id: serviceComment.id,
    document_version_id: serviceComment.documentVersionId,
    user_id: serviceComment.userId,
    content: serviceComment.content,
    page_number: serviceComment.pageNumber || null,
    location_data: serviceComment.locationData,
    created_at: serviceComment.createdAt.toISOString(),
    updated_at: serviceComment.updatedAt.toISOString(),
    resolved: serviceComment.resolved,
    parent_comment_id: serviceComment.parentCommentId || null,
    user: serviceComment.user ? {
      id: serviceComment.user.id,
      name: serviceComment.user.name,
      avatar_url: serviceComment.user.avatarUrl
    } : undefined,
    replies: serviceComment.replies ? serviceComment.replies.map(mapServiceCommentToDbComment) : undefined
  };
};
