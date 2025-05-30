
import React from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDocumentListActions } from "@/hooks/useDocumentListActions";
import { useDocumentExpansion } from "@/hooks/useDocumentExpansion";
import DocumentListItem from "./DocumentListItem";

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  onDeleteDocument: (document: Document) => void;
  userRole?: string;
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
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  isLoading,
  onSelectDocument,
  selectedDocument,
  documentVersions,
  loadingVersions,
  onDeleteVersion,
  onSelectVersion,
  selectedVersionId,
  onShareVersion,
  isParticipant,
  dealId,
  onVersionsUpdated
}) => {
  const { handleAnalyzeDocument } = useDocumentListActions();
  const { expandedDocId, toggleDocumentExpand } = useDocumentExpansion(onSelectDocument);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-muted/40 rounded p-3 flex items-center">
            <Skeleton className="h-8 w-8 rounded mr-3" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h2 className="font-semibold mb-2">Documents ({documents.length})</h2>
      
      {documents.length === 0 ? (
        <div className="text-center py-8 bg-muted/20 rounded-lg">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <p className="mt-2 text-muted-foreground">No documents uploaded yet</p>
          <p className="text-xs text-muted-foreground mt-1">Upload a document to get started</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[calc(45vh-100px)] overflow-y-auto pr-2">
          <div className="space-y-2">
            {documents.map((document) => (
              <DocumentListItem
                key={document.id}
                document={document}
                isSelected={selectedDocument?.id === document.id}
                isExpanded={expandedDocId === document.id}
                onToggleExpand={() => toggleDocumentExpand(document)}
                onAnalyze={handleAnalyzeDocument}
                documentVersions={documentVersions}
                loadingVersions={loadingVersions}
                onDeleteVersion={onDeleteVersion}
                onSelectVersion={onSelectVersion}
                selectedVersionId={selectedVersionId}
                onShareVersion={onShareVersion}
                isParticipant={isParticipant}
                dealId={dealId}
                onVersionsUpdated={onVersionsUpdated}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default DocumentList;
