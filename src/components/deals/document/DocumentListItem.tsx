
import { useState } from 'react';
import { Document, DocumentVersion } from '@/types/deal';
import { ChevronDown, ChevronRight, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentVersionList from './DocumentVersionList';
import { getCommentCount } from '@/hooks/utils/documentCommentUtils';
import { useDocumentComments } from '@/hooks/documentComments';

interface DocumentListItemProps {
  document: Document;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  versions: DocumentVersion[];
  loadingVersions: boolean;
  userRole: string;
  userId?: string;
  onDeleteVersion?: (version: DocumentVersion) => void;
  onSelectVersion?: (version: DocumentVersion) => void;
  isParticipant?: boolean;
}

const DocumentListItem = ({
  document,
  isSelected,
  onSelect,
  onDelete,
  versions,
  loadingVersions,
  userRole,
  userId,
  onDeleteVersion,
  onSelectVersion,
  isParticipant = false
}: DocumentListItemProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const canDelete = () => {
    if (!isParticipant) return false;
    if (userRole === 'admin') return true;
    if (userRole === 'seller' || userRole === 'buyer') {
      return document.uploadedBy === userId;
    }
    return false;
  };
  
  // Calculate total comments for all versions of this document
  let commentCount = 0;
  versions.forEach(version => {
    const { comments } = useDocumentComments(version.id);
    commentCount += getCommentCount(comments);
  });
  
  const handleToggleExpand = () => {
    setExpanded(!expanded);
    if (!expanded) {
      onSelect();
    }
  };
  
  return (
    <div className="border rounded-md overflow-hidden mb-2">
      <div 
        className={`flex items-center justify-between p-3 ${isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'} cursor-pointer`}
        onClick={handleToggleExpand}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <div className="font-medium">{document.name}</div>
            <div className="text-xs text-muted-foreground">
              {document.category || document.type} • {versions.length} version{versions.length !== 1 ? 's' : ''}
              {commentCount > 0 && ` • ${commentCount} comment${commentCount !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
        
        {canDelete() && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {expanded && (
        <div className="p-3 pt-0 border-t">
          <DocumentVersionList
            versions={versions}
            isLoading={loadingVersions}
            userRole={userRole}
            onDeleteVersion={onDeleteVersion}
            onSelectVersion={onSelectVersion}
            userId={userId}
            isParticipant={isParticipant}
          />
        </div>
      )}
    </div>
  );
};

export default DocumentListItem;
