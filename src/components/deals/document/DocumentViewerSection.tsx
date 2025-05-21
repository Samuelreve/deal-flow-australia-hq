
import React, { useState, useEffect } from 'react';
import { useDocumentAI } from "@/hooks/document-ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentViewer from "@/components/documents/DocumentViewer";
import { FileCog, FileQuestion, FileText } from "lucide-react";
import { Document, DocumentVersion } from "@/types/deal";
import { useLocation } from 'react-router-dom';
import DocumentAnalysisButton from './DocumentAnalysisButton';
import DocumentSummaryButton from './DocumentSummaryButton';
import SmartContractAssistant from './SmartContractAssistant';
import ContractAnalyzerDialog from './ContractAnalyzerDialog';

interface DocumentViewerSectionProps {
  selectedVersionUrl: string;
  documentVersions: DocumentVersion[];
  dealId: string;
  selectedDocument: Document | null;
  selectedVersionId: string;
}

const DocumentViewerSection: React.FC<DocumentViewerSectionProps> = ({ 
  selectedVersionUrl, 
  documentVersions, 
  dealId,
  selectedDocument,
  selectedVersionId
}) => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const location = useLocation();
  
  // Check URL for analysis parameters
  const queryParams = new URLSearchParams(location.search);
  const shouldAnalyze = queryParams.get('analyze') === 'true';
  const analysisDocId = queryParams.get('docId');
  const analysisVersionId = queryParams.get('versionId');
  
  // State for Contract Analyzer Dialog
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
    <div className="lg:col-span-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Document Viewer
            </div>
          </CardTitle>
          <div className="flex space-x-2">
            {selectedDocument && selectedVersionId && (
              <>
                <DocumentAnalysisButton 
                  dealId={dealId}
                  documentId={selectedDocument.id}
                  versionId={selectedVersionId}
                />
                <DocumentSummaryButton 
                  dealId={dealId}
                  documentId={selectedDocument.id}
                  documentVersionId={selectedVersionId}
                />
                {/* Add Contract Analyzer button */}
                <button 
                  onClick={() => setAnalyzerOpen(true)}
                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 transition-colors text-blue-700 rounded flex items-center"
                >
                  <FileQuestion className="h-3.5 w-3.5 mr-1" />
                  Contract Analyzer
                </button>
                {/* Smart Contract Assistant Component */}
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
            />
          ) : (
            <div className="border rounded-md p-8 text-center text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>Select a document to view</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Contract Analyzer Dialog */}
      {selectedDocument && selectedVersionId && (
        <ContractAnalyzerDialog
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
