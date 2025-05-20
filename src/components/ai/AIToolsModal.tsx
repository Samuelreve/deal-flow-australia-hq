
import React, { useState, useEffect } from 'react';
import { Brain, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDocumentAI } from '@/hooks/useDocumentAI';
import { toast } from '@/components/ui/use-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Types for deals and documents
interface DealSummary {
  id: string;
  title: string;
  business_name: string;
  status: string;
}

interface DocumentSummary {
  id: string;
  name: string;
  versionId: string; 
}

interface AIToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIToolsModal: React.FC<AIToolsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  // State for tool selection and context
  const [activeTab, setActiveTab] = useState<string>('deals');
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [clauseText, setClauseText] = useState<string>('');
  
  // Data loading states
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  
  // AI operation states
  const [aiOperation, setAiOperation] = useState<string>('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [disclaimer, setDisclaimer] = useState<string>('');

  // Initialize AI operations hook
  const {
    loading: aiLoading,
    error: aiError,
    summarizeDeal,
    predictDealHealth,
    summarizeDocument,
    explainClause,
    summarizeContract,
    explainContractClause
  } = useDocumentAI({
    dealId: selectedDealId,
    documentId: selectedDocumentId
  });

  // Fetch deals when modal opens
  useEffect(() => {
    const fetchDeals = async () => {
      if (!isOpen || !user) return;
      
      setLoadingDeals(true);
      try {
        // Get deals where user is a participant
        const { data, error } = await supabase
          .from('deals')
          .select('id, title, business_name, status')
          .order('updated_at', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        setDeals(data as DealSummary[]);
      } catch (error) {
        console.error('Error fetching deals:', error);
        toast({
          title: 'Failed to load deals',
          description: 'Please try again later',
          variant: 'destructive'
        });
      } finally {
        setLoadingDeals(false);
      }
    };

    fetchDeals();
  }, [isOpen, user]);

  // Fetch documents when a deal is selected
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!selectedDealId) {
        setDocuments([]);
        return;
      }
      
      setLoadingDocs(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select(`
            id,
            name,
            document_versions (id, version_number)
          `)
          .eq('deal_id', selectedDealId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Map to format we need with latest version ID
        const docsWithVersions = (data || []).map(doc => ({
          id: doc.id,
          name: doc.name,
          versionId: doc.document_versions?.[0]?.id || ''
        })).filter(doc => doc.versionId);
        
        setDocuments(docsWithVersions);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: 'Failed to load documents',
          description: 'Please try again later',
          variant: 'destructive'
        });
      } finally {
        setLoadingDocs(false);
      }
    };

    if (selectedDealId) {
      fetchDocuments();
    }
  }, [selectedDealId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('deals');
      setSelectedDealId('');
      setSelectedDocumentId('');
      setSelectedVersionId('');
      setClauseText('');
      setAiOperation('');
      setAiResult(null);
    }
  }, [isOpen]);

  // Handle AI operation execution
  const handleRunAI = async () => {
    setAiResult(null);
    setDisclaimer('');
    
    try {
      let result;
      
      switch (aiOperation) {
        case 'summarize_deal':
          result = await summarizeDeal(selectedDealId);
          break;
        case 'predict_deal_health':
          result = await predictDealHealth(selectedDealId);
          break;
        case 'summarize_document':
          result = await summarizeDocument(selectedDocumentId, selectedVersionId);
          break;
        case 'summarize_contract':
          result = await summarizeContract(selectedDocumentId, selectedVersionId);
          break;
        case 'explain_clause':
          result = await explainClause(clauseText);
          break;
        case 'explain_contract_clause':
          result = await explainContractClause(clauseText, selectedDocumentId, selectedVersionId);
          break;
        default:
          throw new Error('Unknown AI operation');
      }
      
      if (result) {
        setAiResult(result);
        setDisclaimer(result.disclaimer || '');
      }
    } catch (error: any) {
      console.error(`Error executing AI operation ${aiOperation}:`, error);
      toast({
        title: 'AI Operation Failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  // Determine if the run button should be disabled
  const isRunDisabled = () => {
    if (aiLoading) return true;
    
    switch (aiOperation) {
      case 'summarize_deal':
      case 'predict_deal_health':
        return !selectedDealId;
      case 'summarize_document':
      case 'summarize_contract':
        return !selectedDocumentId || !selectedVersionId;
      case 'explain_clause':
        return !clauseText;
      case 'explain_contract_clause':
        return !selectedDocumentId || !selectedVersionId || !clauseText;
      default:
        return true;
    }
  };

  // Render the tool selection view
  const renderToolSelection = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
      <Button 
        onClick={() => {
          setActiveTab('deals');
          setAiOperation('summarize_deal');
        }}
        variant="outline" 
        className="h-24 flex flex-col items-center justify-center gap-2"
      >
        <Brain className="h-8 w-8 text-primary" />
        <span>Summarize Deal</span>
      </Button>
      
      <Button 
        onClick={() => {
          setActiveTab('deals');
          setAiOperation('predict_deal_health');
        }}
        variant="outline" 
        className="h-24 flex flex-col items-center justify-center gap-2"
      >
        <Brain className="h-8 w-8 text-primary" />
        <span>Predict Deal Health</span>
      </Button>
      
      <Button 
        onClick={() => {
          setActiveTab('documents');
          setAiOperation('summarize_document');
        }}
        variant="outline" 
        className="h-24 flex flex-col items-center justify-center gap-2"
      >
        <Brain className="h-8 w-8 text-primary" />
        <span>Document Summary</span>
      </Button>
      
      <Button 
        onClick={() => {
          setActiveTab('documents');
          setAiOperation('explain_clause');
        }}
        variant="outline" 
        className="h-24 flex flex-col items-center justify-center gap-2"
      >
        <Brain className="h-8 w-8 text-primary" />
        <span>Explain Text</span>
      </Button>
      
      <Button 
        onClick={() => {
          setActiveTab('documents');
          setAiOperation('summarize_contract');
        }}
        variant="outline" 
        className="h-24 flex flex-col items-center justify-center gap-2"
      >
        <Brain className="h-8 w-8 text-primary" />
        <span>Contract Summary</span>
      </Button>
      
      <Button 
        onClick={() => {
          setActiveTab('documents');
          setAiOperation('explain_contract_clause');
        }}
        variant="outline" 
        className="h-24 flex flex-col items-center justify-center gap-2"
      >
        <Brain className="h-8 w-8 text-primary" />
        <span>Explain Contract Clause</span>
      </Button>
    </div>
  );

  // Render the main content based on operation selection
  const renderContent = () => {
    // If no operation selected, show tool selection
    if (!aiOperation) {
      return renderToolSelection();
    }
    
    return (
      <div className="flex flex-col space-y-4 py-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => setAiOperation('')}
            className="p-0 h-8 mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">
            {aiOperation === 'summarize_deal' && 'Summarize Deal'}
            {aiOperation === 'predict_deal_health' && 'Predict Deal Health'}
            {aiOperation === 'summarize_document' && 'Document Summary'}
            {aiOperation === 'explain_clause' && 'Explain Text'}
            {aiOperation === 'summarize_contract' && 'Contract Summary'}
            {aiOperation === 'explain_contract_clause' && 'Explain Contract Clause'}
          </h3>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="deals">Select Deal</TabsTrigger>
            {(aiOperation === 'summarize_document' || aiOperation === 'explain_clause' || 
              aiOperation === 'summarize_contract' || aiOperation === 'explain_contract_clause') && (
              <TabsTrigger value="documents">Select Document</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="deals">
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="deal">Select a deal</Label>
                <Select 
                  value={selectedDealId} 
                  onValueChange={(value) => {
                    setSelectedDealId(value);
                    setSelectedDocumentId('');
                    setSelectedVersionId('');
                  }}
                  disabled={loadingDeals || aiLoading}
                >
                  <SelectTrigger id="deal">
                    <SelectValue placeholder="Select deal..." />
                  </SelectTrigger>
                  <SelectContent>
                    {deals.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        {deal.title} ({deal.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loadingDeals && <p className="text-sm text-muted-foreground mt-2">Loading deals...</p>}
              </div>

              {(activeTab === 'deals' && (aiOperation === 'summarize_document' || 
                 aiOperation === 'explain_clause' || aiOperation === 'summarize_contract' || 
                 aiOperation === 'explain_contract_clause')) && (
                <Button 
                  onClick={() => setActiveTab('documents')}
                  disabled={!selectedDealId}
                >
                  Next: Select Document
                </Button>
              )}

              {(aiOperation === 'summarize_deal' || aiOperation === 'predict_deal_health') && (
                <Button 
                  onClick={handleRunAI}
                  disabled={isRunDisabled()}
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Run AI Analysis'
                  )}
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="document">Select a document</Label>
                <Select 
                  value={selectedDocumentId} 
                  onValueChange={(value) => {
                    setSelectedDocumentId(value);
                    // Find and set the version ID for the selected document
                    const doc = documents.find(d => d.id === value);
                    setSelectedVersionId(doc?.versionId || '');
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
              
              {(aiOperation === 'explain_clause' || aiOperation === 'explain_contract_clause') && (
                <div>
                  <Label htmlFor="clause-text">Enter text to explain</Label>
                  <Textarea
                    id="clause-text"
                    value={clauseText}
                    onChange={(e) => setClauseText(e.target.value)}
                    placeholder="Paste the text you want explained..."
                    rows={5}
                    disabled={aiLoading}
                    className="mt-1"
                  />
                </div>
              )}
              
              <Button 
                onClick={handleRunAI}
                disabled={isRunDisabled()}
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Run AI Analysis'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {aiResult && (
          <div className="mt-4 border rounded-lg p-4 bg-muted/20 space-y-4 max-h-[300px] overflow-y-auto">
            <h4 className="font-medium">AI Analysis Result</h4>
            
            {aiOperation === 'summarize_deal' && aiResult.summary && (
              <div className="whitespace-pre-wrap text-sm">{aiResult.summary}</div>
            )}
            
            {aiOperation === 'predict_deal_health' && aiResult.prediction && (
              <div className="whitespace-pre-wrap text-sm">{aiResult.prediction}</div>
            )}
            
            {(aiOperation === 'summarize_document' || aiOperation === 'summarize_contract') && aiResult.summaryText && (
              <div className="whitespace-pre-wrap text-sm">{aiResult.summaryText}</div>
            )}
            
            {(aiOperation === 'explain_clause' || aiOperation === 'explain_contract_clause') && aiResult.explanation && (
              <div className="whitespace-pre-wrap text-sm">{aiResult.explanation}</div>
            )}
            
            {disclaimer && (
              <p className="text-xs text-muted-foreground italic border-t pt-2">
                {disclaimer}
              </p>
            )}
          </div>
        )}
        
        {aiError && (
          <div className="mt-4 border border-destructive/50 rounded-lg p-4 bg-destructive/10">
            <p className="text-sm text-destructive font-medium">Error: {aiError}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Assistant
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-1">
          {renderContent()}
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIToolsModal;
