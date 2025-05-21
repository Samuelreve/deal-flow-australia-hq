
import React, { useState, useEffect } from 'react';
import { useDocumentAI } from "@/hooks/document-ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentViewer from "@/components/documents/DocumentViewer";
import { FileCog, FileQuestion, FileText, History } from "lucide-react";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { useLocation } from 'react-router-dom';
import DocumentAnalysisButton from './DocumentAnalysisButton';
import DocumentSummaryButton from './DocumentSummaryButton';
import SmartContractAssistant from './SmartContractAssistant';
import EnhancedDocumentAnalyzer from './EnhancedDocumentAnalyzer';
import { Button } from "@/components/ui/button";
import DocumentVersionComparison from './DocumentVersionComparison';
import DocumentVersionMetadata from './DocumentVersionMetadata';

interface DocumentViewerSectionProps {
  selectedVersionUrl: string;
  documentVersions: DocumentVersion[];
  dealId: string;
  selectedDocument: Document | null;
  selectedVersionId: string;
  onVersionsUpdated?: () => void;
}

const DocumentViewerSection: React.FC<DocumentViewerSectionProps> = ({ 
  selectedVersionUrl, 
  documentVersions, 
  dealId,
  selectedDocument,
  selectedVersionId,
  onVersionsUpdated = () => {}
}) => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const location = useLocation();
  
  // Get the currently selected version object
  const selectedVersion = documentVersions.find(v => v.id === selectedVersionId);
  
  // Check URL for analysis parameters
  const queryParams = new URLSearchParams(location.search);
  const shouldAnalyze = queryParams.get('analyze') === 'true';
  const analysisDocId = queryParams.get('docId');
  const analysisVersionId = queryParams.get('versionId');
  
  // State for Enhanced Document Analyzer Dialog
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  
  // Check if we should open the analyzer automatically
  useEffect(() => {
    if (shouldAnalyze && 
        analysisDocId && 
        analysisVersionId && 
        selectedDocument?.id === analysisDocId &&
        selectedVersionId === analysisVersionId) {
      setAnalyzerOpen(true);
    }
  }, [shouldAnalyze, analysisDocId, analysisVersionId, selectedDocument, selectedVersionId]);

  const handleTextSelection = (selectedText: string | null) => {
    setSelectedText(selectedText);
  };
  
  return (
    <div className="lg:col-span-2 space-y-4">
      {/* Document Version Metadata */}
      {selectedVersion && selectedDocument && (
        <DocumentVersionMetadata
          version={selectedVersion}
          dealId={dealId}
          onUpdate={onVersionsUpdated}
        />
      )}

      {/* Document Viewer Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Document Viewer
            </div>
          </CardTitle>
          <div className="flex space-x-2">
            {documentVersions.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setComparisonOpen(true)}
                className="flex items-center gap-1"
              >
                <History className="h-4 w-4" />
                Compare Versions
              </Button>
            )}
            {selectedDocument && selectedVersionId && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAnalyzerOpen(true)}
                  className="flex items-center gap-1"
                >
                  <FileCog className="h-4 w-4" />
                  Enhanced Analysis
                </Button>
                <SmartContractAssistant
                  dealId={dealId}
                  documentId={selectedDocument.id}
                  versionId={selectedVersionId}
                  selectedText={selectedText}
                />
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedVersionUrl ? (
            <DocumentViewer 
              documentUrl={selectedVersionUrl} 
              onTextSelection={handleTextSelection}
              dealId={dealId}
              documentId={selectedDocument?.id}
              versionId={selectedVersionId}
            />
          ) : (
            <div className="border rounded-md p-8 text-center text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>Select a document to view</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Version Comparison Dialog */}
      <DocumentVersionComparison
        open={comparisonOpen}
        onOpenChange={setComparisonOpen}
        versions={documentVersions}
        dealId={dealId}
      />
      
      {/* Enhanced Document Analyzer Dialog */}
      {selectedDocument && selectedVersionId && (
        <EnhancedDocumentAnalyzer
          dealId={dealId}
          documentId={selectedDocument.id}
          versionId={selectedVersionId}
          open={analyzerOpen}
          onOpenChange={setAnalyzerOpen}
        />
      )}
    </div>
  );
};

export default DocumentViewerSection;
