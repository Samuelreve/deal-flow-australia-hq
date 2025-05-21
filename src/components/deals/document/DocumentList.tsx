
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { Loader2, FileText, ChevronRight, ChevronDown, FileCog, Share2, Trash, Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDocumentSize } from "@/utils/documentTypeAdapter";
import { getFileIconByType } from "@/lib/fileIcons";
import DocumentAnalysisButton from "./DocumentAnalysisButton";

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  onDeleteDocument: (document: Document) => void;
  userRole?: string;
  userId?: string;
  isParticipant: boolean;
  onSelectDocument: (document: Document) => Promise<void>;
  selectedDocument: Document | null;
  documentVersions: DocumentVersion[];
  loadingVersions: boolean;
  onDeleteVersion: (version: DocumentVersion) => void;
  onSelectVersion: (version: DocumentVersion) => void;
  selectedVersionId: string;
  onShareVersion: (version: DocumentVersion) => void;
  dealId: string;
  onVersionsUpdated: () => void;
}

const DocumentList = ({
  documents,
  isLoading,
  onDeleteDocument,
  userRole = "",
  userId,
  isParticipant,
  onSelectDocument,
  selectedDocument,
  documentVersions,
  loadingVersions,
  onDeleteVersion,
  onSelectVersion,
  selectedVersionId,
  onShareVersion,
  dealId,
  onVersionsUpdated
}: DocumentListProps) => {
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Toggle document expansion for versions
  const toggleDocumentExpand = async (document: Document) => {
    if (expandedDocId === document.id) {
      setExpandedDocId(null);
    } else {
      setExpandedDocId(document.id);
      await onSelectDocument(document);
    }
  };
  
  // Handle analyze button click
  const handleAnalyzeDocument = (document: Document, versionId: string | undefined) => {
    if (!versionId) return;
    
    // Add analyze parameters to URL
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("analyze", "true");
    searchParams.set("docId", document.id);
    searchParams.set("versionId", versionId);
    
    // Navigate to the same page with updated params
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-muted/40 rounded p-3 flex items-center">
            <Skeleton className="h-8 w-8 rounded mr-3" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h2 className="font-semibold mb-2">Documents ({documents.length})</h2>
      
      {documents.length === 0 ? (
        <div className="text-center py-8 bg-muted/20 rounded-lg">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <p className="mt-2 text-muted-foreground">No documents uploaded yet</p>
          <p className="text-xs text-muted-foreground mt-1">Upload a document to get started</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[calc(45vh-100px)] overflow-y-auto pr-2">
          <div className="space-y-2">
            {documents.map((document) => {
              const isExpanded = expandedDocId === document.id;
              const Icon = getFileIconByType(document.type || "");
              
              return (
                <div key={document.id} className="bg-muted/20 rounded-md overflow-hidden">
                  <div 
                    className={`p-3 flex items-center hover:bg-muted/40 cursor-pointer ${
                      selectedDocument?.id === document.id ? "bg-muted/40" : ""
                    }`}
                    onClick={() => toggleDocumentExpand(document)}
                  >
                    <div className="mr-3 text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="flex-1 truncate">
                          <p className="text-sm font-medium truncate">{document.name}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2 h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnalyzeDocument(document, document.latestVersionId);
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
                  
                  {/* Document Versions */}
                  {isExpanded && (
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
                                      onClick={() => handleAnalyzeDocument(document, version.id)}
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
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default DocumentList;
