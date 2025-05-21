
import { Document, DocumentVersion } from "@/types/documentVersion";
import DocumentList from "./DocumentList";
import DocumentUpload from "./DocumentUpload";
import InlineDocumentAnalyzer from "./InlineDocumentAnalyzer";
import { adaptDocumentsToDealType } from "@/utils/documentTypeAdapter";

interface DocumentSidebarProps {
  documents: Document[];
  isLoading: boolean;
  onDeleteDocument: (document: Document) => void;
  userRole: string;
  userId?: string;
  isParticipant: boolean;
  onSelectDocument: (document: Document) => Promise<void>;
  selectedDocument: Document | null;
  documentVersions: DocumentVersion[];
  loadingVersions: boolean;
  onDeleteVersion: (version: DocumentVersion) => void;
  onSelectVersion: (version: DocumentVersion) => void;
  selectedVersionId: string;
  onShareVersion: (version: DocumentVersion) => void;
  dealId: string;
  onVersionsUpdated: () => void;
  uploading: boolean;
  onUpload: (file: File, category: string, documentId?: string) => Promise<Document | null>;
  lastUploadedDocument: {
    id: string;
    versionId: string;
    name: string;
  } | null;
  onCloseAnalyzer: () => void;
}

const DocumentSidebar = ({
  documents,
  isLoading,
  onDeleteDocument,
  userRole,
  userId,
  isParticipant,
  onSelectDocument,
  selectedDocument,
  documentVersions,
  loadingVersions,
  onDeleteVersion,
  onSelectVersion,
  selectedVersionId,
  onShareVersion,
  dealId,
  onVersionsUpdated,
  uploading,
  onUpload,
  lastUploadedDocument,
  onCloseAnalyzer
}: DocumentSidebarProps) => {
  return (
    <div className="lg:col-span-1">
      {/* Document List */}
      <DocumentList 
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
      />

      {/* Document Upload Section */}
      <DocumentUpload 
        onUpload={onUpload}
        uploading={uploading}
        userRole={userRole}
        isParticipant={isParticipant}
        documents={adaptDocumentsToDealType(documents)}
        dealId={dealId}
      />
      
      {/* Inline Document Analyzer for the last uploaded document */}
      {lastUploadedDocument && (
        <InlineDocumentAnalyzer
          documentId={lastUploadedDocument.id}
          versionId={lastUploadedDocument.versionId}
          documentName={lastUploadedDocument.name}
          dealId={dealId}
          userRole={userRole}
          onClose={onCloseAnalyzer}
        />
      )}
    </div>
  );
};

export default DocumentSidebar;
