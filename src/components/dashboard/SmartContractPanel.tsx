
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, Brain, Search, AlertTriangle, MessageSquare, ArrowRight } from "lucide-react";

interface SmartContractPanelProps {
  dealId?: string;
}

const SmartContractPanel: React.FC<SmartContractPanelProps> = ({ dealId }) => {
  const navigate = useNavigate();
  
  const aiFeatures = [
    {
      icon: <Brain className="h-4 w-4 text-blue-500" />,
      title: "Smart Summarization",
      description: "Get instant summaries in plain language"
    },
    {
      icon: <Search className="h-4 w-4 text-green-500" />,
      title: "Term Explanation", 
      description: "Understand complex legal terminology"
    },
    {
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      title: "Risk Analysis",
      description: "Identify potential risks and red flags"
    },
    {
      icon: <MessageSquare className="h-4 w-4 text-purple-500" />,
      title: "Q&A Assistant",
      description: "Ask questions about any part of your contract"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-blue-900">Smart Contract Assistant</CardTitle>
            <p className="text-sm text-blue-600 mt-1">AI-Powered Contract Analysis</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium mb-2">✨ AI Features Available:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                {feature.icon}
                <div>
                  <p className="text-xs font-medium text-blue-900">{feature.title}</p>
                  <p className="text-xs text-blue-700">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            onClick={() => navigate('/contract-analysis')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Brain className="h-5 w-5 mr-2" />
            Open Contract Analysis
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <p className="text-xs text-blue-600 mt-3">
            Upload and analyze contracts with our AI-powered tools
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="text-xs text-blue-600 w-full text-center bg-blue-50 rounded p-2">
          🔒 Secure AI processing • Your documents are protected
        </div>
      </CardFooter>
    </Card>
  );
};

export default SmartContractPanel;
