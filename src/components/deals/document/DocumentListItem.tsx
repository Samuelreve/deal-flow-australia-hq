
import React, { useState } from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { ChevronRight, ChevronDown, FileCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDocumentSize } from "@/utils/documentTypeAdapter";
import { getFileIconByType } from "@/lib/fileIcons";
import DocumentVersionsList from "./DocumentVersionsList";

interface DocumentListItemProps {
  document: Document;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAnalyze: (document: Document, versionId?: string) => void;
  documentVersions: DocumentVersion[];
  loadingVersions: boolean;
  onDeleteVersion: (version: DocumentVersion) => void;
  onSelectVersion: (version: DocumentVersion) => void;
  selectedVersionId: string;
  onShareVersion: (version: DocumentVersion) => void;
  isParticipant: boolean;
  dealId: string;
  onVersionsUpdated: () => void;
}

const DocumentListItem: React.FC<DocumentListItemProps> = ({
  document,
  isSelected,
  isExpanded,
  onToggleExpand,
  onAnalyze,
  documentVersions,
  loadingVersions,
  onDeleteVersion,
  onSelectVersion,
  selectedVersionId,
  onShareVersion,
  isParticipant,
  dealId,
  onVersionsUpdated
}) => {
  const Icon = getFileIconByType(document.type || "");
  
  return (
    <div className="bg-muted/20 rounded-md overflow-hidden">
      <div 
        className={`p-3 flex items-center hover:bg-muted/40 cursor-pointer ${
          isSelected ? "bg-muted/40" : ""
        }`}
        onClick={onToggleExpand}
      >
        <div className="mr-3 text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <div className="flex-1 truncate">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{document.name}</p>
                {document.category && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5">
                    {document.category}
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze(document, document.latestVersionId);
              }}
              title="Analyze document"
            >
              <FileCog className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {document.latestVersion && (
              <>
                <span>{formatDocumentSize(document.latestVersion.size)}</span>
                <span className="mx-1">•</span>
              </>
            )}
            <span>{new Date(document.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="ml-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <DocumentVersionsList
          documentVersions={documentVersions}
          loadingVersions={loadingVersions}
          onDeleteVersion={onDeleteVersion}
          onSelectVersion={onSelectVersion}
          selectedVersionId={selectedVersionId}
          onShareVersion={onShareVersion}
          onAnalyze={onAnalyze}
          document={document}
          isParticipant={isParticipant}
          dealId={dealId}
          onVersionsUpdated={onVersionsUpdated}
        />
      )}
    </div>
  );
};

export default DocumentListItem;
