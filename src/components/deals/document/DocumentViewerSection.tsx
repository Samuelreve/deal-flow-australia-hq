
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Document, DocumentVersion } from "@/types/documentVersion";
import DocumentViewerContainer from "@/components/documents/DocumentViewerContainer";
import DocumentVersionSelector from "./DocumentVersionSelector";
import DocumentAnalyzerView from "./DocumentAnalyzerView";
import { Loader2 } from "lucide-react";

interface DocumentViewerSectionProps {
  selectedVersionUrl: string;
  documentVersions: DocumentVersion[];
  dealId: string;
  selectedDocument: Document | null;
  selectedVersionId: string;
  onVersionsUpdated: () => void;
}

const DocumentViewerSection = ({
  selectedVersionUrl,
  documentVersions,
  dealId,
  selectedDocument,
  selectedVersionId,
  onVersionsUpdated
}: DocumentViewerSectionProps) => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const documentViewerRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Check URL parameters for document analysis
  const analyzeModeActive = searchParams.get("analyze") === "true";
  const docIdToAnalyze = searchParams.get("docId");
  const versionIdToAnalyze = searchParams.get("versionId");
  
  // Handle closing the analyzer
  const handleCloseAnalyzer = () => {
    // Remove analyze params from URL
    searchParams.delete("analyze");
    searchParams.delete("docId");
    searchParams.delete("versionId");
    setSearchParams(searchParams);
  };
  
  // Handle text selection in the document viewer
  const handleTextSelected = (text: string | null) => {
    setSelectedText(text);
  };

  return (
    <div className="lg:col-span-2">
      {/* Version Selector */}
      <div className="mb-4">
        <DocumentVersionSelector
          versions={documentVersions}
          selectedVersionId={selectedVersionId}
          onSelectVersion={(versionId) => {
            // Find the version by ID and trigger the selection callback
            const version = documentVersions.find(v => v.id === versionId);
            if (version) {
              onVersionsUpdated();
            }
          }}
        />
      </div>

      {/* Document Analyzer when URL parameters are present */}
      {analyzeModeActive && docIdToAnalyze && versionIdToAnalyze && selectedDocument && (
        <div className="mb-4">
          <DocumentAnalyzerView
            dealId={dealId}
            documentId={docIdToAnalyze}
            versionId={versionIdToAnalyze}
            onClose={handleCloseAnalyzer}
          />
        </div>
      )}
      
      {/* Document Viewer */}
      <div className="bg-background rounded-lg overflow-hidden border h-[calc(100vh-220px)]">
        {selectedVersionUrl ? (
          <DocumentViewerContainer
            ref={documentViewerRef}
            documentVersionUrl={selectedVersionUrl}
            dealId={dealId}
            documentId={selectedDocument?.id}
            versionId={selectedVersionId}
            onTextSelected={handleTextSelected}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Loading document...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewerSection;
