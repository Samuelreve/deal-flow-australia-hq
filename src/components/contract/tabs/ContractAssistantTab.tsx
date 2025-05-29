
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Search, Loader, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { QuestionHistoryItem } from '@/types/contract';
import ProfessionalQuestionFormatter from '../formatting/ProfessionalQuestionFormatter';

interface ContractAssistantTabProps {
  onAskQuestion: (question: string) => Promise<{ answer: string; sources?: string[] } | null>;
  questionHistory?: QuestionHistoryItem[];
  isProcessing?: boolean;
  contractText?: string;
  documentSummary?: any;
}

const ContractAssistantTab: React.FC<ContractAssistantTabProps> = ({ 
  onAskQuestion,
  questionHistory = [],
  isProcessing = false,
  contractText = '',
  documentSummary
}) => {
  const [question, setQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
  const [currentSources, setCurrentSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    if (!contractText.trim()) {
      toast.error("No document uploaded", {
        description: "Please upload a contract first to ask questions about it"
      });
      return;
    }
    
    setLoading(true);
    setCurrentAnswer(null);
    setCurrentSources([]);
    
    try {
      const response = await onAskQuestion(question);
      
      if (response) {
        setCurrentAnswer(response.answer);
        if (response.sources) {
          setCurrentSources(response.sources);
        }
        setQuestion("");
      }
    } catch (error) {
      toast.error("Failed to process your question");
      console.error("Error processing question:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && !isProcessing) {
      handleAskQuestion();
    }
  };

  const getAnswerText = (answer: string | { answer: string; sources?: string[] }): string => {
    if (typeof answer === 'string') {
      return answer;
    }
    return answer.answer;
  };

  const getSources = (item: QuestionHistoryItem): string[] => {
    if (typeof item.answer !== 'string' && item.answer.sources) {
      return item.answer.sources;
    }
    return item.sources || [];
  };

  const renderDocumentStatus = () => {
    if (!documentSummary) {
      return (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            No document uploaded yet. Please upload a contract to start asking questions.
          </AlertDescription>
        </Alert>
      );
    }

    if (documentSummary.category === 'CONTRACT') {
      return (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ Legal contract uploaded successfully! You can now ask questions about this document.
          </AlertDescription>
        </Alert>
      );
    }

    if (documentSummary.category === 'FINANCIAL') {
      return (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            ⚠️ Financial document detected. Please upload a legal contract for detailed analysis.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="mb-6 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          ❌ Please upload a legal contract for analysis.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="space-y-6">
      {renderDocumentStatus()}
      
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <CardTitle className="text-xl flex items-center gap-3 text-slate-800">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            Legal Contract Assistant
          </CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            Ask specific questions about the uploaded contract to receive detailed legal analysis and answers based on the document content.
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="flex gap-3 mb-6">
            <Input 
              placeholder="e.g., What are the termination clauses in this contract?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading || isProcessing || !contractText.trim()}
              className="flex-1 border-slate-300 focus:border-blue-500"
            />
            <Button 
              onClick={handleAskQuestion} 
              disabled={loading || isProcessing || !contractText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {(loading || isProcessing) ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Ask Question
                </>
              )}
            </Button>
          </div>
          
          {currentAnswer && (
            <div className="mb-6">
              <ProfessionalQuestionFormatter
                question={question || "Recent Question"}
                answer={currentAnswer}
                sources={currentSources}
                timestamp={Date.now()}
              />
            </div>
          )}

          {questionHistory.length > 0 && !currentAnswer && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                Previous Legal Inquiries
              </h3>
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {questionHistory.slice().reverse().map((item, index) => (
                  <ProfessionalQuestionFormatter
                    key={index}
                    question={item.question}
                    answer={getAnswerText(item.answer)}
                    sources={getSources(item)}
                    timestamp={item.timestamp}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Suggested Legal Inquiries:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• "Who are the contracting parties and their respective roles?"</li>
              <li>• "What are the key obligations and responsibilities of each party?"</li>
              <li>• "What are the termination conditions and notice requirements?"</li>
              <li>• "What are the payment terms, amounts, and schedules?"</li>
              <li>• "What liability limitations and indemnification clauses exist?"</li>
              <li>• "Are there any dispute resolution or governing law provisions?"</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <Alert className="bg-amber-50 border-amber-200">
        <AlertDescription className="text-sm text-amber-800">
          ⚖️ <strong>Professional Disclaimer:</strong> This AI analysis is based solely on the uploaded contract content and is provided for informational purposes only. It does not constitute legal advice. Always consult with a qualified attorney for professional legal guidance.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ContractAssistantTab;
