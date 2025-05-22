
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, FileText, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DocQAPanelProps {
  documentId?: string;
  versionId?: string;
  dealId?: string;
  documentName?: string;
}

// Sample questions for the demo
const sampleQuestions = [
  "What are the confidentiality obligations?",
  "What happens if this contract is breached?",
  "How long is the term of this agreement?",
  "What jurisdiction governs this contract?"
];

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
};

const DocQAPanel: React.FC<DocQAPanelProps> = ({ 
  documentId, 
  versionId,
  dealId,
  documentName = "Contract Document"
}) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: `Ask me any question about ${documentName}. I'll provide clear, simple answers based on the document content.`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to generate a sample answer (for demo purposes)
  const generateDemoAnswer = (q: string): string => {
    if (q.toLowerCase().includes("confidentiality")) {
      return "The confidentiality obligations require both parties to keep all shared information secret for a period of 5 years. This includes customer data, business plans, and any proprietary information disclosed during the business relationship.";
    } 
    else if (q.toLowerCase().includes("breach")) {
      return "In case of breach, the injured party can seek injunctive relief in addition to monetary damages. The agreement specifies that the breaching party will be responsible for reasonable legal fees incurred by the non-breaching party in enforcing the contract.";
    }
    else if (q.toLowerCase().includes("term") || q.toLowerCase().includes("duration")) {
      return "This agreement has an initial term of 2 years from the effective date, with automatic renewal for successive 1-year periods unless either party provides written notice of non-renewal at least 30 days before the end of the current term.";
    }
    else if (q.toLowerCase().includes("jurisdiction") || q.toLowerCase().includes("govern")) {
      return "This agreement is governed by the laws of the State of California, and any disputes will be resolved in the courts of San Francisco County.";
    }
    return "Based on my analysis of the document, this contract specifies that " + q.toLowerCase().replace("what", "").replace("?", "") + " must be handled according to section 3.2, which outlines the specific processes and requirements for both parties.";
  };
  
  // Send a message
  const handleSendMessage = async () => {
    if (!question.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: question,
      isUser: true,
      timestamp: new Date()
    };
    
    // Add loading message
    const loadingMessage: Message = {
      id: `ai-loading-${Date.now()}`,
      content: "",
      isUser: false,
      timestamp: new Date(),
      isLoading: true
    };
    
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setQuestion("");
    setIsLoading(true);
    
    try {
      // In a real implementation, we would call an API here
      // For demo purposes, we'll just generate a sample answer after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const answer = generateDemoAnswer(userMessage.content);
      
      // Replace loading message with actual answer
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id 
            ? { ...msg, content: answer, isLoading: false } 
            : msg
        )
      );
    } catch (error) {
      console.error("Error getting answer:", error);
      
      // Replace loading message with error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id 
            ? { ...msg, content: "Sorry, I couldn't process your question. Please try again.", isLoading: false } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle sample question click
  const handleSampleQuestionClick = (q: string) => {
    setQuestion(q);
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Document Q&A</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            {documentName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col pt-2">
        <div className="flex-grow overflow-y-auto mb-4 space-y-4 max-h-[400px]">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                <Avatar className={`h-8 w-8 ${msg.isUser ? 'bg-blue-100' : 'bg-neutral-100'}`}>
                  <AvatarFallback>
                    {msg.isUser ? 'U' : 'AI'}
                  </AvatarFallback>
                </Avatar>
                <div className={`rounded-lg px-4 py-2 ${
                  msg.isUser 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {msg.isLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {sampleQuestions.map((q, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => handleSampleQuestionClick(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
        
        <Separator className="my-2" />
        
        <div className="flex items-center gap-2 mt-2">
          <Input
            placeholder="Ask a question about this document..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Answers are based solely on this document's content
        </p>
      </CardContent>
    </Card>
  );
};

export default DocQAPanel;
