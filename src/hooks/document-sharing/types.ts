
export interface ShareLinkWithStatus {
  id: string;
  document_version_id: string;
  shared_by_user_id: string;
  expires_at: string | null;
  token: string;
  created_at: string;
  can_download: boolean;
  is_active: boolean;
  status: 'active' | 'expired' | 'revoked';
  share_url: string;
}

export interface ShareLinkOptions {
  expiresAt?: Date | null; 
  canDownload: boolean;
  recipients?: string[];
  customMessage?: string;
}

export interface DocumentSharingHookOptions {
  userRole: string;
  userId?: string;
  documentOwnerId: string;
}
