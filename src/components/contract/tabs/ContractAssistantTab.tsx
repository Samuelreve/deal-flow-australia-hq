
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { QuestionHistoryItem } from '@/types/contract';
import DocumentStatusAlert from './components/DocumentStatusAlert';
import QuestionInputSection from './components/QuestionInputSection';
import QuestionHistoryDisplay from './components/QuestionHistoryDisplay';
import LegalSuggestions from './components/LegalSuggestions';
import ProfessionalDisclaimer from './components/ProfessionalDisclaimer';

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

  return (
    <div className="space-y-6">
      <DocumentStatusAlert 
        documentSummary={documentSummary}
        contractText={contractText}
      />
      
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
          <QuestionInputSection
            question={question}
            setQuestion={setQuestion}
            onSubmit={handleAskQuestion}
            loading={loading}
            isProcessing={isProcessing}
            contractText={contractText}
          />
          
          <QuestionHistoryDisplay
            questionHistory={questionHistory}
            currentAnswer={currentAnswer}
            currentSources={currentSources}
            question={question}
          />
          
          <LegalSuggestions />
        </CardContent>
      </Card>
      
      <ProfessionalDisclaimer />
    </div>
  );
};

export default ContractAssistantTab;
