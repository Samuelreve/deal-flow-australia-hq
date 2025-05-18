
import { useState } from "react";
import { Document, DocumentVersion } from "@/types/deal";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Trash2, ChevronDown, ChevronUp, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import DocumentVersionList from "./DocumentVersionList";

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  userRole?: string;
  userId?: string;
  onDeleteDocument: (document: Document) => void;
  isParticipant?: boolean;
  onSelectDocument?: (document: Document) => void;
  selectedDocument?: Document | null;
  documentVersions?: DocumentVersion[];
  loadingVersions?: boolean;
  onDeleteVersion?: (version: DocumentVersion) => void;
}

const DocumentList = ({ 
  documents, 
  isLoading, 
  userRole = 'user',
  userId,
  onDeleteDocument,
  isParticipant = false,
  onSelectDocument,
  selectedDocument,
  documentVersions = [],
  loadingVersions = false,
  onDeleteVersion
}: DocumentListProps) => {
  const [expandedDocumentId, setExpandedDocumentId] = useState<string | null>(null);

  const toggleDocumentVersions = async (document: Document) => {
    if (expandedDocumentId === document.id) {
      setExpandedDocumentId(null);
    } else {
      setExpandedDocumentId(document.id);
      if (onSelectDocument) {
        onSelectDocument(document);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading documents...</span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg bg-muted/30">
        <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No documents yet</h3>
        <p className="text-sm text-muted-foreground">
          {isParticipant && ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase()) 
            ? 'Upload documents to share them with the deal participants.'
            : 'No documents have been uploaded to this deal yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 border-b">
        <h3 className="font-medium">Documents</h3>
      </div>
      <ul className="divide-y">
        {documents.map((doc) => {
          // User can delete a document if:
          // 1. They are the uploader, OR
          // 2. They have admin role, OR
          // 3. They have seller role
          const canDelete = 
            isParticipant && 
            (doc.uploadedBy === userId || 
             userRole === 'admin' || 
             userRole === 'seller');
          
          const isExpanded = expandedDocumentId === doc.id;
          
          return (
            <li key={doc.id}>
              <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-medium text-primary hover:underline truncate"
                    >
                      {doc.name}
                    </a>
                    
                    {/* Display document category as a badge if it exists */}
                    {doc.category && (
                      <Badge variant="outline" className="ml-2">
                        {doc.category}
                      </Badge>
                    )}
                    
                    {/* Badge for versioned documents */}
                    {doc.latestVersionId && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                        v{doc.version || 1}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Uploaded {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })} • {(doc.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Version History Button */}
                  {onSelectDocument && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleDocumentVersions(doc)}
                      className="text-muted-foreground"
                    >
                      {isExpanded ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <History className="h-4 w-4" />
                      }
                    </Button>
                  )}
                  
                  {/* Delete Document Button */}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteDocument(doc)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Document Versions Panel */}
              {isExpanded && selectedDocument && selectedDocument.id === doc.id && (
                <DocumentVersionList 
                  documentId={doc.id}
                  versions={documentVersions}
                  isLoading={loadingVersions}
                  userRole={userRole}
                  userId={userId}
                  onDeleteVersion={onDeleteVersion}
                  isParticipant={isParticipant}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DocumentList;
