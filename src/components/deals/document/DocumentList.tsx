
import { Document } from "@/types/deal";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  userRole?: string;
  userId?: string;
  onDeleteDocument: (document: Document) => void;
}

const DocumentList = ({ 
  documents, 
  isLoading, 
  userRole = 'user',
  userId,
  onDeleteDocument 
}: DocumentListProps) => {
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
          Upload documents to share them with the deal participants.
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
          const canDelete = userRole === 'admin' || doc.uploadedBy === userId;
          
          return (
            <li key={doc.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
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
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString()} • {(doc.size / 1024).toFixed(1)} KB
                </p>
              </div>
              
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default DocumentList;
