import { useState } from "react";
import { Document, DocumentVersion } from "@/types/deal";
import { Loader2, FileText, Trash2, Download, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import DocumentVersionWithComments from "./DocumentVersionWithComments";
import DocumentVersionList from "./DocumentVersionList";
import { useDocumentComments } from "@/hooks/useDocumentComments";
import { Badge } from "@/components/ui/badge";

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  onDeleteDocument?: (document: Document) => void;
  userRole?: string;
  userId?: string;
  isParticipant?: boolean;
  onSelectDocument?: (document: Document) => void;
  selectedDocument?: Document | null;
  documentVersions: DocumentVersion[];
  loadingVersions: boolean;
  onDeleteVersion?: (version: DocumentVersion) => void;
}

const DocumentList = ({
  documents,
  isLoading,
  onDeleteDocument,
  userRole = 'user',
  userId,
  isParticipant = false,
  onSelectDocument,
  selectedDocument,
  documentVersions,
  loadingVersions,
  onDeleteVersion
}: DocumentListProps) => {
  // Add state for selected version
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);

  // Handle version selection
  const handleSelectVersion = (version: DocumentVersion) => {
    setSelectedVersion(version);
  };

  // Reset selected version when document changes
  const handleSelectDocument = (document: Document) => {
    setSelectedVersion(null);
    onSelectDocument?.(document);
  };
  
  // If a version is selected, show it with comments
  if (selectedVersion) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-2 border-b flex justify-between items-center">
          <button 
            className="text-sm text-muted-foreground hover:text-primary flex items-center"
            onClick={() => setSelectedVersion(null)}
          >
            ← Back to Versions
          </button>
          <span className="text-sm font-medium">
            {selectedDocument?.name} - Version {selectedVersion.versionNumber}
          </span>
        </div>
        <div className="flex-grow">
          <DocumentVersionWithComments
            version={selectedVersion}
            currentUserDealRole={userRole}
            isParticipant={isParticipant}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading documents...</span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-slate-50">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium mb-1">No documents yet</h3>
        <p className="text-muted-foreground">
          Upload documents to share with deal participants
        </p>
      </div>
    );
  }

  // If a document is selected, show its versions
  if (selectedDocument) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="p-4 bg-white border-b">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{selectedDocument.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedDocument.description || 'No description'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectDocument?.(undefined as any)}
            >
              Back to Documents
            </Button>
          </div>
        </div>

        <DocumentVersionList
          documentId={selectedDocument.id}
          versions={documentVersions}
          isLoading={loadingVersions}
          userRole={userRole}
          userId={userId}
          onDeleteVersion={onDeleteVersion}
          isParticipant={isParticipant}
          onSelectVersion={handleSelectVersion}
          selectedVersionId={selectedVersion?.id}
        />
      </div>
    );
  }

  // Otherwise, show the list of documents
  return (
    <div className="space-y-4">
      {documents.map((document) => {
        const canDelete = 
          isParticipant && 
          onDeleteDocument &&
          (document.uploadedBy === userId || 
           userRole === 'admin' || 
           userRole === 'seller');
        
        return (
          <div 
            key={document.id} 
            className="border rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow"
          >
            <div 
              className="p-4 cursor-pointer"
              onClick={() => handleSelectDocument(document)}
            >
              <div className="flex justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium truncate">{document.name}</h3>
                    {document.category && (
                      <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                        {document.category}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-1 text-sm text-muted-foreground">
                    Uploaded {formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}
                    {document.description && (
                      <span className="mx-1">•</span>
                    )}
                    {document.description}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Download Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <a href={document.url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  
                  {/* Delete Button */}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument?.(document);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-4 py-2 bg-slate-50 border-t text-xs text-muted-foreground flex justify-between">
              <div>
                Version {document.version} • {(document.size / 1024).toFixed(1)} KB
              </div>
              <button 
                className="text-primary hover:underline"
                onClick={() => handleSelectDocument(document)}
              >
                View all versions
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DocumentList;
