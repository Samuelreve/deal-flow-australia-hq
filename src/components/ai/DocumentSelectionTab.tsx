
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DocumentSummary } from '@/hooks/useAIToolsContext';

interface DocumentSelectionTabProps {
  documents: DocumentSummary[];
  loadingDocs: boolean;
  selectedDealId: string;
  selectedDocumentId: string;
  onDocumentSelect: (id: string, versionId: string) => void;
  activeOperation: string;
  aiLoading: boolean;
  onRunAI: () => void;
  clauseText: string;
  onClauseTextChange: (text: string) => void;
}

const DocumentSelectionTab: React.FC<DocumentSelectionTabProps> = ({
  documents,
  loadingDocs,
  selectedDealId,
  selectedDocumentId,
  onDocumentSelect,
  activeOperation,
  aiLoading,
  onRunAI,
  clauseText,
  onClauseTextChange
}) => {
  // Determine if clause text input is needed
  const needsClauseText = ['explain_clause', 'explain_contract_clause'].includes(activeOperation);
  
  // Determine button text based on operation
  const getButtonText = () => {
    switch (activeOperation) {
      case 'summarize_document':
        return 'Get Document Summary';
      case 'summarize_contract':
        return 'Get Contract Summary';
      case 'explain_clause':
        return 'Get Text Explanation';
      case 'explain_contract_clause':
        return 'Get Clause Explanation';
      default:
        return 'Run AI Analysis';
    }
  };
  
  // Determine if the run button should be disabled
  const isRunDisabled = () => {
    if (aiLoading) return true;
    if (!selectedDocumentId) return true;
    if (needsClauseText && !clauseText) return true;
    return false;
  };

  return (
    <TabsContent value="documents">
      <div className="space-y-4 py-2">
        <div>
          <Label htmlFor="document">Select a document</Label>
          <Select 
            value={selectedDocumentId} 
            onValueChange={(value) => {
              const doc = documents.find(d => d.id === value);
              onDocumentSelect(value, doc?.versionId || '');
            }}
            disabled={loadingDocs || aiLoading || !selectedDealId}
          >
            <SelectTrigger id="document">
              <SelectValue placeholder="Select document..." />
            </SelectTrigger>
            <SelectContent>
              {documents.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {loadingDocs && <p className="text-sm text-muted-foreground mt-2">Loading documents...</p>}
          {!loadingDocs && documents.length === 0 && selectedDealId && (
            <p className="text-sm text-muted-foreground mt-2">No documents found for this deal.</p>
          )}
        </div>
        
        {needsClauseText && (
          <div>
            <Label htmlFor="clause-text">Enter text to explain</Label>
            <Textarea
              id="clause-text"
              value={clauseText}
              onChange={(e) => onClauseTextChange(e.target.value)}
              placeholder="Paste the text you want explained..."
              rows={5}
              disabled={aiLoading}
              className="mt-1"
            />
          </div>
        )}
        
        <Button 
          onClick={onRunAI}
          disabled={isRunDisabled()}
        >
          {aiLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            getButtonText()
          )}
        </Button>
      </div>
    </TabsContent>
  );
};

export default DocumentSelectionTab;
