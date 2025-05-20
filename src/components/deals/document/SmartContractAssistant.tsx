
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDocumentAI } from "@/hooks/document-ai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SmartContractAssistantProps {
  dealId: string;
  documentId: string;
  versionId: string;
  userRole?: string;
  className?: string;
  selectedText?: string | null;
}

const SmartContractAssistant: React.FC<SmartContractAssistantProps> = ({
  dealId,
  documentId,
  versionId,
  userRole = 'user',
  className,
  selectedText
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [explanationResult, setExplanationResult] = useState<any>(null);
  const [disclaimer, setDisclaimer] = useState<string>('');
  
  const {
    summarizeContract,
    explainContractClause,
    loading: isAnalyzing,
  } = useDocumentAI({ dealId, documentId });

  // Check if user role allows contract analysis
  const canAnalyzeContracts = ['admin', 'seller', 'buyer', 'lawyer'].includes(userRole.toLowerCase());
  
  if (!canAnalyzeContracts) {
    return null;
  }
  
  const handleSummarize = async () => {
    setActiveTab("summary");
    
    try {
      const result = await summarizeContract(documentId, versionId);
      
      if (result) {
        setSummaryResult(result);
        setDisclaimer(result.disclaimer);
      }
    } catch (error) {
      console.error('Contract summarization failed:', error);
    }
  };
  
  const handleExplainClause = async () => {
    if (!selectedText) {
      return;
    }
    
    setActiveTab("explanation");
    
    try {
      const result = await explainContractClause(selectedText, documentId, versionId);
      
      if (result) {
        setExplanationResult(result);
        setDisclaimer(result.disclaimer);
      }
    } catch (error) {
      console.error('Clause explanation failed:', error);
    }
  };
  
  const handleOpen = () => {
    setIsDialogOpen(true);
    handleSummarize();
  };
  
  const handleClose = () => {
    setIsDialogOpen(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setSummaryResult(null);
      setExplanationResult(null);
    }, 300);
  };
  
  const renderSummaryTab = () => {
    if (isAnalyzing) {
      return <div className="py-8 text-center">Analyzing contract...</div>;
    }
    
    if (!summaryResult) {
      return <div className="py-8 text-center">No summary available</div>;
    }
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Summary</h3>
          <p className="mt-2 whitespace-pre-line">{summaryResult.summaryText}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">Contract Type</h3>
          <p className="mt-2">{summaryResult.contractType || "Not specified"}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">Parties Involved</h3>
          {summaryResult.parties && summaryResult.parties.length > 0 ? (
            <ul className="mt-2 list-disc pl-5">
              {summaryResult.parties.map((party: string, i: number) => (
                <li key={i}>{party}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2">No parties explicitly specified</p>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-medium">Key Obligations</h3>
          {summaryResult.keyObligations && summaryResult.keyObligations.length > 0 ? (
            <ul className="mt-2 list-disc pl-5">
              {summaryResult.keyObligations.map((obligation: string, i: number) => (
                <li key={i}>{obligation}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2">No key obligations explicitly specified</p>
          )}
        </div>
        
        {/* Add similar sections for timelines, terminationRules, and liabilities */}
      </div>
    );
  };
  
  const renderExplanationTab = () => {
    if (isAnalyzing) {
      return <div className="py-8 text-center">Analyzing clause...</div>;
    }
    
    if (!explanationResult) {
      return <div className="py-8 text-center">
        {selectedText ? "Analyzing..." : "Select text in the document to explain a clause"}
      </div>;
    }
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Clause Explanation</h3>
          <p className="mt-2 whitespace-pre-line">{explanationResult.explanation}</p>
        </div>
        
        {explanationResult.isAmbiguous && (
          <Alert className="bg-amber-50 border-amber-300">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              This clause contains ambiguous language. {explanationResult.ambiguityExplanation}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };
  
  return (
    <>
      <Button 
        variant="outline"
        onClick={handleOpen}
        className={`gap-2 ${className || ''}`}
        size="sm"
      >
        <FileText className="h-4 w-4" />
        Contract Assistant
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Smart Contract Assistant</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="summary" onClick={handleSummarize}>Contract Summary</TabsTrigger>
              <TabsTrigger value="explanation" 
                onClick={handleExplainClause}
                disabled={!selectedText}>
                Explain Selected Clause
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              {renderSummaryTab()}
            </TabsContent>
            
            <TabsContent value="explanation">
              {renderExplanationTab()}
            </TabsContent>
          </Tabs>
          
          {disclaimer && (
            <Alert className="mt-6 bg-blue-50 border-blue-200">
              <AlertDescription className="text-xs text-blue-700">
                {disclaimer}
              </AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SmartContractAssistant;
