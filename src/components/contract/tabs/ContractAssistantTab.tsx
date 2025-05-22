
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Search, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface ContractAssistantTabProps {
  onAskQuestion: (question: string) => Promise<string | null>;
}

const ContractAssistantTab: React.FC<ContractAssistantTabProps> = ({ onAskQuestion }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    setIsLoading(true);
    setAnswer(null);
    
    try {
      const response = await onAskQuestion(question);
      setAnswer(response);
    } catch (error) {
      toast.error("Failed to process your question");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contract Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Ask questions about the contract to get instant answers.
          </p>
          
          <div className="flex gap-2">
            <Input 
              placeholder="e.g., What is the duration of this agreement?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              disabled={isLoading}
            />
            <Button onClick={handleAskQuestion} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Ask
                </>
              )}
            </Button>
          </div>
          
          {answer && (
            <div className="bg-muted p-4 rounded-md mt-4">
              <h3 className="font-medium mb-2">Answer:</h3>
              <p className="text-sm">{answer}</p>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground pt-2">
            Try questions like "What happens if confidentiality is breached?" or "What is the duration of this agreement?"
          </div>
        </CardContent>
      </Card>
      
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-sm text-blue-700">
          The AI analyzes the exact contents of your contract to provide accurate answers based solely on the document.
        </AlertDescription>
      </Alert>
    </>
  );
};

export default ContractAssistantTab;
