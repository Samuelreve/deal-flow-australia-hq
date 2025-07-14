
import { User } from "./auth";

export interface DocumentVersionAnnotation {
  id: string;
  versionId: string;
  userId: string;
  content: string;
  createdAt: Date;
  user?: User;
}

export interface DocumentVersionTag {
  id: string;
  versionId: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  size: number;
  type: string;
  description?: string;
  tags?: DocumentVersionTag[];
  annotations?: DocumentVersionAnnotation[];
  isRestored?: boolean;
}

export interface Document {
  id: string;
  name: string;
  category?: string;
  type?: string;
  status?: 'draft' | 'final' | 'signed';
  uploadedBy?: string;
  latestVersionId?: string;
  latestVersion?: DocumentVersion;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VersionComparisonResult {
  additions: string[];
  deletions: string[];
  unchanged: string[];
  differenceSummary?: string;
}
