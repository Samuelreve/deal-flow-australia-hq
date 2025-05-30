
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import DocumentStatusAlert from './components/DocumentStatusAlert';
import ProfessionalDisclaimer from './components/ProfessionalDisclaimer';
import LegalSuggestions from './components/LegalSuggestions';
import QuestionInputSection from './components/QuestionInputSection';
import { MessageSquare, FileText, Brain, Sparkles } from 'lucide-react';

interface QuestionHistoryItem {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  type: 'question' | 'analysis';
  sources?: string[];
  analysisType?: string;
}

interface EnhancedContractAssistantTabProps {
  onAskQuestion: (question: string) => Promise<any>;
  onAnalyzeContract: (analysisType: string) => Promise<any>;
  questionHistory: QuestionHistoryItem[];
  isProcessing: boolean;
  contractText: string;
  isMobile?: boolean;
}

const EnhancedContractAssistantTab: React.FC<EnhancedContractAssistantTabProps> = ({
  onAskQuestion,
  onAnalyzeContract,
  questionHistory,
  isProcessing,
  contractText,
  isMobile = false
}) => {
  const [question, setQuestion] = useState('');
  const [autoSummaryGenerated, setAutoSummaryGenerated] = useState(false);

  console.log('🎯 EnhancedContractAssistantTab render:', {
    contractTextLength: contractText.length,
    questionHistoryLength: questionHistory.length,
    isProcessing,
    autoSummaryGenerated
  });

  // Auto-generate summary when contract text is available
  useEffect(() => {
    const generateAutoSummary = async () => {
      if (contractText && contractText.length > 100 && !autoSummaryGenerated && !isProcessing) {
        console.log('🤖 Auto-generating contract summary...');
        setAutoSummaryGenerated(true);
        
        try {
          await onAnalyzeContract('summary');
          console.log('✅ Auto-summary generated successfully');
        } catch (error) {
          console.error('❌ Failed to auto-generate summary:', error);
          setAutoSummaryGenerated(false);
        }
      }
    };

    // Small delay to ensure UI is ready
    const timer = setTimeout(generateAutoSummary, 1000);
    return () => clearTimeout(timer);
  }, [contractText, autoSummaryGenerated, isProcessing, onAnalyzeContract]);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    
    console.log('📝 Submitting question:', question);
    setQuestion('');
    
    try {
      await onAskQuestion(question);
    } catch (error) {
      console.error('❌ Error submitting question:', error);
    }
  };

  const handleQuickAnalysis = async (analysisType: string) => {
    console.log('⚡ Quick analysis:', analysisType);
    
    try {
      await onAnalyzeContract(analysisType);
    } catch (error) {
      console.error('❌ Error in quick analysis:', error);
    }
  };

  const hasContent = contractText && contractText.length > 50;
  const hasHistory = questionHistory.length > 0;

  return (
    <div className="space-y-6">
      {/* Document Status */}
      <DocumentStatusAlert 
        contractText={contractText}
        documentSummary={null}
      />

      {/* Quick Analysis Actions */}
      {hasContent && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
              <Brain className="h-5 w-5" />
              Quick Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickAnalysis('key_terms')}
                disabled={isProcessing}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
              >
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">Key Terms</div>
                  <div className="text-sm text-blue-700">Extract important clauses</div>
                </div>
              </button>
              
              <button
                onClick={() => handleQuickAnalysis('risks')}
                disabled={isProcessing}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
              >
                <Sparkles className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">Risk Analysis</div>
                  <div className="text-sm text-blue-700">Identify potential issues</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ask About This Contract
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionInputSection
            question={question}
            setQuestion={setQuestion}
            onSubmit={handleSubmit}
            loading={isProcessing}
            isProcessing={isProcessing}
            contractText={contractText}
          />
        </CardContent>
      </Card>

      {/* Question History */}
      {hasHistory && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questionHistory.map((item, index) => (
              <div key={item.id} className="space-y-2">
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-medium text-sm">{item.question}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className="bg-background p-3 rounded-md border">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">{item.answer}</div>
                  </div>
                  {item.sources && item.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Sources: {item.sources.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
                {index < questionHistory.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Legal Suggestions */}
      {!hasHistory && hasContent && (
        <LegalSuggestions />
      )}

      {/* Professional Disclaimer */}
      <ProfessionalDisclaimer />
    </div>
  );
};

export default EnhancedContractAssistantTab;
