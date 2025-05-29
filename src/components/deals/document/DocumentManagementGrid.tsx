
import React from 'react';
import { Document, DocumentVersion } from "@/types/documentVersion";
import DocumentManagementMain from "./DocumentManagementMain";

interface DocumentManagementGridProps {
  // Document state
  documents: Document[];
  isLoading: boolean;
  selectedDocument: Document | null;
  documentVersions: DocumentVersion[];
  loadingVersions: boolean;
  selectedVersionUrl: string | null;
  selectedVersionId: string | null;
  
  // User and permissions
  userRole: string;
  userId?: string;
  isParticipant: boolean;
  dealId: string;
  
  // Upload state
  uploading: boolean;
  lastUploadedDocument: {
    id: string;
    versionId: string;
    name: string;
  } | null;
  
  // Handlers
  onSelectDocument: (document: Document) => Promise<void>;
  onDeleteDocument: (document: Document) => void;
  onDeleteVersion: (version: DocumentVersion) => void;
  onSelectVersion: (version: DocumentVersion) => void;
  onShareVersion: (version: DocumentVersion) => void;
  onVersionsUpdated: () => void;
  onUpload: (file: File, category: string, documentId?: string) => Promise<Document | null>;
  onCloseAnalyzer: () => void;
}

const DocumentManagementGrid: React.FC<DocumentManagementGridProps> = (props) => {
  return <DocumentManagementMain {...props} />;
};

export default DocumentManagementGrid;
