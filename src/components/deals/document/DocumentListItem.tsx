
import { Document } from "@/types/deal";
import { FileText, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface DocumentListItemProps {
  document: Document;
  canDelete: boolean;
  onDelete: (document: Document) => void;
  onSelect: (document: Document) => void;
}

const DocumentListItem = ({ 
  document, 
  canDelete, 
  onDelete, 
  onSelect 
}: DocumentListItemProps) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow">
      <div 
        className="p-4 cursor-pointer"
        onClick={() => onSelect(document)}
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
              Uploaded {formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
              {document.category && (
                <span className="mx-1">•</span>
              )}
              {document.category}
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
                  onDelete(document);
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
          onClick={() => onSelect(document)}
        >
          View all versions
        </button>
      </div>
    </div>
  );
};

export default DocumentListItem;
