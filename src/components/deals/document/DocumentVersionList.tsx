
import { DocumentVersion } from "@/types/deal";
import DocumentVersionHeader from "./DocumentVersionHeader";
import { Separator } from "@/components/ui/separator";
import { Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentVersionListProps {
  versions: DocumentVersion[];
  loading: boolean;
  onDeleteVersion: (version: DocumentVersion) => void;
  onSelectVersion: (version: DocumentVersion) => void;
  selectedVersionId: string;
  onShareVersion: (version: DocumentVersion) => void;
  userRole: string;
  userId?: string;
  documentOwnerId: string;
}

const DocumentVersionList = ({
  versions,
  loading,
  onDeleteVersion,
  onSelectVersion,
  selectedVersionId,
  onShareVersion,
  userRole,
  userId,
  documentOwnerId,
}: DocumentVersionListProps) => {
  const canDelete = userRole === "admin" || (userRole === "seller" && userId === documentOwnerId);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2">
        No versions available
      </div>
    );
  }

  return (
    <div className="space-y-1 mt-2">
      <h4 className="text-sm font-medium text-muted-foreground">Versions</h4>
      <div className="bg-muted/40 rounded-md p-1 space-y-1">
        {versions.map((version) => (
          <div 
            key={version.id} 
            className={`p-2 rounded-md ${
              selectedVersionId === version.id ? "bg-accent/50" : "hover:bg-muted"
            }`}
          >
            <div className="flex items-center justify-between">
              <DocumentVersionHeader 
                version={version}
                onClick={() => onSelectVersion(version)}
              />
              
              <div className="flex space-x-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShareVersion(version);
                  }}
                  title="Share this version"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                
                {canDelete && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteVersion(version);
                    }}
                    title="Delete this version"
                    className="text-destructive hover:text-destructive"
                  >
                    <span className="sr-only">Delete</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </Button>
                )}
              </div>
            </div>
            
            {version.description && (
              <p className="text-xs text-muted-foreground mt-1">{version.description}</p>
            )}

            <Separator className="mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentVersionList;
