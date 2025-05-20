
import { useEffect, useMemo } from "react";
import { Document, DocumentVersion } from "@/types/deal";
import DocumentListItem from "./DocumentListItem";
import DocumentEmptyState from "./DocumentEmptyState";
import DocumentLoadingState from "./DocumentLoadingState";
import { useDocumentVersions } from "@/hooks/useDocumentVersions";

export interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  onDeleteDocument: (document: Document) => void;
  userRole: string;
  userId?: string;
  isParticipant?: boolean;
  onSelectDocument: (document: Document) => Promise<void>;
  selectedDocument: Document | null;
  documentVersions: DocumentVersion[];
  loadingVersions: boolean;
  onDeleteVersion: (version: DocumentVersion) => void;
  onSelectVersion: (version: DocumentVersion) => void;
  selectedVersionId: string;
  onShareVersion: (version: DocumentVersion) => void;
}

const DocumentList = ({
  documents,
  isLoading,
  onDeleteDocument,
  userRole,
  userId,
  isParticipant = false,
  onSelectDocument,
  selectedDocument,
  documentVersions,
  loadingVersions,
  onDeleteVersion,
  onSelectVersion,
  selectedVersionId,
  onShareVersion,
}: DocumentListProps) => {
  // Group documents by category for display
  const documentsByCategory = useMemo(() => {
    const groupedDocs = documents.reduce((acc, doc) => {
      const category = doc.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(doc);
      return acc;
    }, {} as Record<string, Document[]>);

    // Return an array of [category, documents] pairs, sorted by category
    return Object.entries(groupedDocs).sort(([a], [b]) => a.localeCompare(b));
  }, [documents]);

  if (isLoading) {
    return <DocumentLoadingState />;
  }

  if (documents.length === 0) {
    return <DocumentEmptyState isParticipant={isParticipant} />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Documents</h3>
      
      {documentsByCategory.map(([category, docs]) => (
        <div key={category} className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
          <div className="space-y-1">
            {docs.map((doc) => (
              <DocumentListItem
                key={doc.id}
                document={doc}
                onDelete={() => onDeleteDocument(doc)}
                userRole={userRole}
                userId={userId}
                isParticipant={isParticipant}
                onSelect={() => onSelectDocument(doc)}
                isSelected={selectedDocument?.id === doc.id}
                versions={selectedDocument?.id === doc.id ? documentVersions : []}
                loadingVersions={loadingVersions}
                onDeleteVersion={onDeleteVersion}
                onSelectVersion={onSelectVersion}
                onShareVersion={onShareVersion}
              />
            ))}
          </div>
        </div>
      ))}
      
    </div>
  );
};

export default DocumentList;
