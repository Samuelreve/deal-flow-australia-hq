
import { Document } from "@/types/deal";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  onDeleteDocument: (document: Document) => void;
  userRole?: string;
  userId?: string;
}

const DocumentList = ({ 
  documents, 
  isLoading, 
  onDeleteDocument, 
  userRole = "admin", 
  userId 
}: DocumentListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse text-muted-foreground">Loading documents...</div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No documents yet</h3>
        <p className="text-muted-foreground mb-4">Upload documents to share with deal participants</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map(doc => (
        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">{doc.name}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>
                  {new Intl.DateTimeFormat("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  }).format(doc.uploadedAt)}
                </span>
                <span className="mx-1">•</span>
                <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                {doc.status === "signed" && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="text-green-600">Signed</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={doc.url} target="_blank" rel="noopener noreferrer">View</a>
            </Button>
            {(userRole === "admin" || doc.uploadedBy === userId) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDeleteDocument(doc)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
