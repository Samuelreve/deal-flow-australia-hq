
import React from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { Loader2, Share2, Trash, FileCog } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DocumentVersionsListProps {
  documentVersions: DocumentVersion[];
  loadingVersions: boolean;
  onDeleteVersion: (version: DocumentVersion) => void;
  onSelectVersion: (version: DocumentVersion) => void;
  selectedVersionId: string;
  onShareVersion: (version: DocumentVersion) => void;
  onAnalyze: (document: Document, versionId?: string) => void;
  document: Document;
  isParticipant: boolean;
  dealId: string;
  onVersionsUpdated: () => void;
}

const DocumentVersionsList: React.FC<DocumentVersionsListProps> = ({
  documentVersions,
  loadingVersions,
  onDeleteVersion,
  onSelectVersion,
  selectedVersionId,
  onShareVersion,
  onAnalyze,
  document,
  isParticipant,
  onVersionsUpdated
}) => {
  return (
    <div className="bg-background rounded-b-md">
      <Separator />
      <div className="p-2">
        <p className="text-xs font-medium mb-2 px-2">Versions</p>
        
        {loadingVersions ? (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
            <span className="text-xs text-muted-foreground">Loading versions...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {documentVersions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No versions available</p>
            ) : (
              documentVersions.map((version) => (
                <div 
                  key={version.id}
                  className={`text-xs rounded-sm px-2 py-1.5 flex items-center ${
                    selectedVersionId === version.id 
                      ? "bg-primary/10" 
                      : "hover:bg-muted/60"
                  }`}
                >
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => onSelectVersion(version)}
                  >
                    <div className="flex items-center">
                      <span>V{version.versionNumber}</span>
                      {version.isRestored && (
                        <Badge variant="outline" className="ml-2 text-[10px] py-0 h-4">
                          Restored
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground mt-0.5">
                      {new Date(version.uploadedAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onAnalyze(document, version.id)}
                      title="Analyze version"
                    >
                      <FileCog className="h-3.5 w-3.5" />
                    </Button>
                    
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onShareVersion(version)}
                      title="Share version"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                    
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onDeleteVersion(version)}
                      disabled={!isParticipant || documentVersions.length === 1}
                      title="Delete version"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentVersionsList;
