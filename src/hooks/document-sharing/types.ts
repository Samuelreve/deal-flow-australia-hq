
// Types for document sharing feature
export interface ShareLinkOptions {
  expiresAt?: Date | null;
  canDownload: boolean;
  recipients?: string[];
  customMessage?: string;
}

export type ShareLinkStatus = 'active' | 'expired' | 'revoked';

export interface ShareLinkWithStatus {
  id: string;
  token: string;
  document_version_id: string;
  shared_by_user_id: string;
  expires_at: string | null;
  can_download: boolean;
  is_active: boolean;
  created_at: string;
  status: ShareLinkStatus;
  share_url: string;
}

export interface DocumentSharingHookOptions {
  userRole?: string;
  userId?: string;
  documentOwnerId?: string;
}

export interface EmailSendResult {
  recipient: string;
  success: boolean;
  error?: string;
}
