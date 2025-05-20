
// Types for document sharing functionality
export interface ShareLinkOptions {
  expires_at?: string | null;
  can_download: boolean;
  recipients?: string[];
  custom_message?: string;
}

export interface ShareLinkResponse {
  success: boolean;
  data?: {
    id: string;
    token: string;
    share_url: string;
    is_active: boolean;
    can_download: boolean;
    expires_at: string | null;
    created_at: string;
    document_version_id: string;
    shared_by_user_id: string;
  };
  email_results?: {
    all_successful: boolean;
    details?: EmailResult[];
  };
  error?: string;
}

export interface EmailResult {
  recipient: string;
  success: boolean;
  error?: string;
}

export interface ShareLinkData {
  id: string;
  token: string;
  document_version_id: string;
  shared_by_user_id: string;
  expires_at: string | null;
  can_download: boolean;
  is_active: boolean;
  created_at: string;
  status?: 'active' | 'expired' | 'revoked';
  share_url?: string;
}

export interface DocumentInfo {
  id: string;
  name: string;
  deal_id: string;
}

export interface DealInfo {
  id: string;
  title: string;
}

export interface UserInfo {
  id: string;
  name?: string;
}
