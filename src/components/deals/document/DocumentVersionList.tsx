
import React from 'react';
import { DocumentVersion } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { File, Trash2 } from 'lucide-react';
import DocumentVersionHeader from './DocumentVersionHeader';

interface DocumentVersionListProps {
  versions: DocumentVersion[];
  isLoading: boolean;
  userRole: string;
  onDeleteVersion?: (version: DocumentVersion) => void;
  onSelectVersion?: (version: DocumentVersion) => void;
  userId?: string;
  isParticipant?: boolean;
}

const DocumentVersionList: React.FC<DocumentVersionListProps> = ({
  versions,
  isLoading,
  userRole,
  onDeleteVersion,
  onSelectVersion,
  userId,
  isParticipant = false
}) => {
  // Check if user has permission to delete versions
  const canDeleteVersion = (version: DocumentVersion): boolean => {
    if (!isParticipant) return false;
    if (userRole === 'admin') return true;
    if (userRole === 'seller' || userRole === 'buyer') {
      return version.uploadedBy === userId;
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="p-2 text-sm text-muted-foreground animate-pulse">
        Loading versions...
      </div>
    );
  }

  if (!versions.length) {
    return (
      <div className="p-2 text-sm text-muted-foreground">
        No versions available.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <DocumentVersionHeader />
      
      {versions.map((version) => (
        <div 
          key={version.id} 
          className="flex items-center justify-between p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors text-sm"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <File className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">Version {version.versionNumber}</span>
                {version.description && (
                  <span className="text-muted-foreground truncate">
                    {version.description}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(version.uploadedAt).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2"
              onClick={() => onSelectVersion?.(version)}
            >
              View
            </Button>
            
            {canDeleteVersion(version) && onDeleteVersion && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => onDeleteVersion(version)}
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

export default DocumentVersionList;
