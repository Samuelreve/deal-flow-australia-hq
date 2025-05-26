
/**
 * Types for document comments functionality
 */

// Document comment model
export interface DocumentComment {
  id: string;
  documentVersionId: string;
  userId: string;
  content: string;
  pageNumber?: number;
  locationData?: any;
  createdAt: Date;
  updatedAt: Date;
  resolved: boolean;
  parentCommentId?: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  replies?: DocumentComment[];
}

// Data transfer object for creating a new document comment
export interface CreateDocumentCommentDto {
  documentVersionId: string;
  content: string;
  pageNumber?: number;
  locationData?: any;
  parentCommentId?: string;
}

// Database comment structure (from Supabase)
export interface DbDocumentComment {
  id: string;
  document_version_id: string;
  user_id: string;
  content: string;
  page_number?: number;
  location_data?: any;
  created_at: string;
  updated_at: string;
  resolved: boolean;
  parent_comment_id?: string;
  profiles?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}
