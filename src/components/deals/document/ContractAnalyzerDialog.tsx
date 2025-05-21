
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDocumentAI } from "@/hooks/document-ai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface ContractAnalyzerDialogProps {
  dealId: string;
  documentId: string;
  versionId: string;
  userRole?: string;
  className?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContractAnalyzerDialog: React.FC<ContractAnalyzerDialogProps> = ({
  dealId,
  documentId,
  versionId,
  userRole = 'user',
  className,
  open,
  onOpenChange
}) => {
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [explanationResult, setExplanationResult] = useState<any>(null);
  const [disclaimer, setDisclaimer] = useState<string>('');
  
  const {
    summarizeContract,
    explainContractClause,
    loading: isAnalyzing,
  } = useDocumentAI({ dealId, documentId });

  // Check if user role allows contract analysis
  const canAnalyzeContracts = ['admin', 'seller', 'buyer', 'lawyer'].includes(userRole.toLowerCase());
  
  // Trigger automatic summary when dialog opens
  useEffect(() => {
    if (open && !summaryResult && !isAnalyzing) {
      handleSummarize();
    }
  }, [open, summaryResult]);
  
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
      toast({
        title: "Analysis failed",
        description: "Could not analyze this contract. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  const handleExplainClause = async () => {
    if (!selectedText.trim()) {
      toast({
        title: "No text selected",
        description: "Please enter some text to explain",
        variant: "destructive"
      });
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
      toast({
        title: "Explanation failed",
        description: "Could not explain the selected text. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) {
      toast({
        title: "No question entered",
        description: "Please enter a question about the contract",
        variant: "destructive"
      });
      return;
    }
    
    setActiveTab("askQuestion");
    
    try {
      // Using explainContractClause with the full text and the question
      const result = await explainContractClause(selectedText || "The entire contract", documentId, versionId, {
        isQuestion: true,
        question: userQuestion
      });
      
      if (result) {
        setExplanationResult(result);
        setDisclaimer(result.disclaimer);
      }
    } catch (error) {
      console.error('Question answering failed:', error);
      toast({
        title: "Failed to answer question",
        description: "Could not answer your question. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  if (!canAnalyzeContracts) {
    return null;
  }
  
  const renderSummaryTab = () => {
    if (isAnalyzing && activeTab === "summary") {
      return (
        <div className="py-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Analyzing contract...</p>
        </div>
      );
    }
    
    if (!summaryResult) {
      return <div className="py-8 text-center">No summary available yet</div>;
    }
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Summary</h3>
          <p className="mt-2 whitespace-pre-line">{summaryResult.summary}</p>
        </div>
        
        {/* Additional structured information would be shown here in production */}
      </div>
    );
  };
  
  const renderExplanationTab = () => {
    if (isAnalyzing && activeTab === "explanation") {
      return (
        <div className="py-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Analyzing clause...</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-md font-medium">Enter text to explain</h3>
          <Textarea 
            className="mt-2" 
            value={selectedText} 
            onChange={(e) => setSelectedText(e.target.value)}
            placeholder="Copy and paste the clause or section you want explained..."
            rows={5}
          />
          
          <Button 
            onClick={handleExplainClause} 
            className="mt-2"
            disabled={!selectedText.trim() || isAnalyzing}
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Explain This Text
          </Button>
        </div>
        
        {explanationResult && activeTab === "explanation" && (
          <div>
            <h3 className="text-lg font-medium">Explanation</h3>
            <p className="mt-2 whitespace-pre-line">{explanationResult.explanation}</p>
            
            {explanationResult.isAmbiguous && (
              <Alert className="bg-amber-50 border-amber-300 mt-4">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  This clause contains potentially ambiguous language that may benefit from clarification.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    );
  };
  
  const renderAskQuestionTab = () => {
    if (isAnalyzing && activeTab === "askQuestion") {
      return (
        <div className="py-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Finding answer...</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-md font-medium">Ask a question about this contract</h3>
          <div className="flex items-center gap-2 mt-2">
            <Input 
              value={userQuestion} 
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="e.g., What happens if I cancel early?"
              className="flex-1"
            />
            <Button 
              onClick={handleAskQuestion} 
              disabled={!userQuestion.trim() || isAnalyzing}
            >
              {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Ask
            </Button>
          </div>
        </div>
        
        {explanationResult && activeTab === "askQuestion" && (
          <div>
            <h3 className="text-lg font-medium">Answer</h3>
            <p className="mt-2 whitespace-pre-line">{explanationResult.explanation}</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-primary" />
            Contract Analyzer
          </DialogTitle>
          <DialogDescription>
            Understand this contract with AI assistance
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="summary" onClick={handleSummarize}>Summary</TabsTrigger>
            <TabsTrigger value="explanation">Explain Text</TabsTrigger>
            <TabsTrigger value="askQuestion">Ask a Question</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            {renderSummaryTab()}
          </TabsContent>
          
          <TabsContent value="explanation">
            {renderExplanationTab()}
          </TabsContent>
          
          <TabsContent value="askQuestion">
            {renderAskQuestionTab()}
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
  );
};

export default ContractAnalyzerDialog;
