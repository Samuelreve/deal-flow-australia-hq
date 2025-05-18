
import { useState } from "react";
import { DocumentVersion } from "@/types/deal";
import { Loader2, FileText, Trash2, Download, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useCommentCounts } from "@/hooks/useCommentCounts";

interface DocumentVersionListProps {
  documentId: string;
  versions: DocumentVersion[];
  isLoading: boolean;
  userRole?: string;
  userId?: string;
  onDeleteVersion?: (version: DocumentVersion) => void;
  isParticipant?: boolean;
  onSelectVersion?: (version: DocumentVersion) => void;
  selectedVersionId?: string;
}

const DocumentVersionList = ({
  documentId,
  versions,
  isLoading,
  userRole = 'user',
  userId,
  onDeleteVersion,
  isParticipant = false,
  onSelectVersion,
  selectedVersionId
}: DocumentVersionListProps) => {
  // Get comment counts for versions
  const { commentCounts, isLoading: isLoadingCounts } = useCommentCounts(
    versions.map(v => v.id)
  );
  
  if (isLoading) {
    return (
      <div className="bg-slate-50 p-4 border-t flex justify-center items-center">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="ml-2 text-sm">Loading versions...</span>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="bg-slate-50 p-4 border-t text-center">
        <p className="text-sm text-muted-foreground">No version history available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border-t">
      <div className="p-3 bg-slate-100 border-b">
        <h4 className="text-sm font-medium">Version History</h4>
      </div>
      <ul className="divide-y divide-slate-200">
        {versions.map((version) => {
          const canDelete = 
            isParticipant && 
            onDeleteVersion &&
            (version.uploadedBy === userId || 
             userRole === 'admin' || 
             userRole === 'seller') &&
             versions.length > 1; // Don't allow deleting the last version
          
          const isSelected = selectedVersionId === version.id;
          const commentCount = commentCounts[version.id] || 0;
          
          return (
            <li 
              key={version.id} 
              className={`p-3 flex items-center text-sm ${isSelected ? 'bg-blue-50' : ''} 
                ${onSelectVersion ? 'cursor-pointer hover:bg-slate-100' : ''}`}
              onClick={() => onSelectVersion?.(version)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="font-medium">Version {version.versionNumber}</span>
                  {version.description && (
                    <span className="ml-2 text-muted-foreground">- {version.description}</span>
                  )}
                  
                  {/* Comment count badge */}
                  <Badge 
                    variant="outline" 
                    className="ml-2 text-xs flex items-center gap-1 py-0 h-5"
                  >
                    <MessageSquare className="h-3 w-3" />
                    {isLoadingCounts ? "..." : commentCount}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Uploaded {formatDistanceToNow(new Date(version.uploadedAt), { addSuffix: true })} • {(version.size / 1024).toFixed(1)} KB
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Download Version Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-muted-foreground hover:text-primary"
                >
                  <a href={version.url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                
                {/* Delete Version Button */}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteVersion?.(version);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DocumentVersionList;
