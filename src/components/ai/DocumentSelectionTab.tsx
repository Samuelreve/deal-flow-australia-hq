
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Document } from '@/types/deal';

interface DocumentSummary {
  id: string;
  name: string;
  latestVersionId?: string;
}

interface DocumentSelectionTabProps {
  documents: DocumentSummary[];
  selectedDocumentId: string | null;
  setSelectedDocumentId: (documentId: string) => void;
  selectedVersionId: string | null;
  setSelectedVersionId: (versionId: string | null) => void;
  selectedText: string;
  setSelectedText: (text: string) => void;
  loadingDocuments: boolean;
  errorMessage: string | null;
  onRunAI: () => void;
  isLoading: boolean;
  activeOperation: string;
}

const DocumentSelectionTab: React.FC<DocumentSelectionTabProps> = ({
  documents,
  selectedDocumentId,
  setSelectedDocumentId,
  selectedVersionId,
  setSelectedVersionId,
  selectedText,
  setSelectedText,
  loadingDocuments,
  errorMessage,
  onRunAI,
  isLoading,
  activeOperation
}) => {
  // Format operation specific button text
  const getOperationButtonText = () => {
    switch (activeOperation) {
      case 'summarize_document':
        return 'Generate Document Summary';
      case 'explain_clause':
        return 'Explain Selected Text';
      case 'summarize_contract':
        return 'Generate Contract Summary';
      case 'explain_contract_clause':
        return 'Explain Contract Clause';
      default:
        return 'Run Analysis';
    }
  };

  // Check if selected text is needed for this operation
  const needsSelectedText = ['explain_clause', 'explain_contract_clause'].includes(activeOperation);
  
  return (
    <TabsContent value="documents" className="flex flex-col space-y-4">
      {loadingDocuments ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading documents...</span>
        </div>
      ) : errorMessage ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="mt-2 text-sm text-destructive">{errorMessage}</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground">No documents found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Upload documents to a deal first to use document analysis tools.
          </p>
        </div>
      ) : (
        <>
          <Select 
            value={selectedDocumentId || ""} 
            onValueChange={(value) => {
              setSelectedDocumentId(value);
              // Find the selected document and use its latest version ID
              const selectedDoc = documents.find(doc => doc.id === value);
              setSelectedVersionId(selectedDoc?.latestVersionId || null);
            }}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a document" />
            </SelectTrigger>
            <SelectContent>
              {documents.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.name || "Untitled Document"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {needsSelectedText && (
            <Textarea
              placeholder={`Enter the contract clause or text you want explained...`}
              value={selectedText}
              onChange={(e) => setSelectedText(e.target.value)}
              className="min-h-[100px]"
              disabled={isLoading}
            />
          )}
          
          <Button
            onClick={onRunAI}
            disabled={!selectedDocumentId || (needsSelectedText && !selectedText.trim()) || isLoading || !selectedVersionId}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getOperationButtonText()}
          </Button>
        </>
      )}
    </TabsContent>
  );
};

export default DocumentSelectionTab;
