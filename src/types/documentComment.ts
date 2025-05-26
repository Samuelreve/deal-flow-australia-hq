
export interface DocumentComment {
  id: string;
  content: string;
  document_version_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  page_number?: number | null;
  location_data?: any;
  resolved: boolean;
  parent_comment_id?: string | null;
  user?: {
    id: string;
    name: string;
    email?: string;
    avatar_url?: string;
  };
  replies?: DocumentComment[];
}

export interface DocumentCommentCreateData {
  document_version_id: string;
  content: string;
  page_number?: number | null;
  location_data?: any;
  selected_text?: string | null;
  parent_comment_id?: string | null;
}

