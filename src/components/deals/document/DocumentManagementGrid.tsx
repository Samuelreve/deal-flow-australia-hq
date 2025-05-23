
import React from 'react';
import { Document, DocumentVersion } from "@/types/documentVersion";
import DocumentSidebar from "./DocumentSidebar";
import DocumentViewerSection from "./DocumentViewerSection";

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

const DocumentManagementGrid: React.FC<DocumentManagementGridProps> = ({
  documents,
  isLoading,
  selectedDocument,
  documentVersions,
  loadingVersions,
  selectedVersionUrl,
  selectedVersionId,
  userRole,
  userId,
  isParticipant,
  dealId,
  uploading,
  lastUploadedDocument,
  onSelectDocument,
  onDeleteDocument,
  onDeleteVersion,
  onSelectVersion,
  onShareVersion,
  onVersionsUpdated,
  onUpload,
  onCloseAnalyzer
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Document sidebar with list and upload functionality */}
      <DocumentSidebar
        documents={documents}
        isLoading={isLoading}
        onDeleteDocument={onDeleteDocument}
        userRole={userRole}
        userId={userId}
        isParticipant={isParticipant}
        onSelectDocument={onSelectDocument}
        selectedDocument={selectedDocument}
        documentVersions={documentVersions}
        loadingVersions={loadingVersions}
        onDeleteVersion={onDeleteVersion}
        onSelectVersion={onSelectVersion}
        selectedVersionId={selectedVersionId}
        onShareVersion={onShareVersion}
        dealId={dealId}
        onVersionsUpdated={onVersionsUpdated}
        uploading={uploading}
        onUpload={onUpload}
        lastUploadedDocument={lastUploadedDocument}
        onCloseAnalyzer={onCloseAnalyzer}
      />
      
      {/* Document Viewer Section */}
      <DocumentViewerSection 
        selectedVersionUrl={selectedVersionUrl}
        documentVersions={documentVersions}
        dealId={dealId}
        selectedDocument={selectedDocument}
        selectedVersionId={selectedVersionId}
        onVersionsUpdated={onVersionsUpdated}
      />
    </div>
  );
};

export default DocumentManagementGrid;
