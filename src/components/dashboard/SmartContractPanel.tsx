
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";

interface SmartContractPanelProps {
  dealId?: string;
}

const SmartContractPanel: React.FC<SmartContractPanelProps> = ({ dealId = "demo-deal" }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const handleTryDemo = () => {
    if (isAuthenticated) {
      navigate(`/deals/${dealId}/documents`);
    } else {
      navigate('/login?redirect=/deals/demo-deal/documents');
    }
  };
  
  return (
    <Card className="bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5 text-primary" />
          Smart Contract Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Upload any contract to get instant AI-powered analysis, summaries, and answers to your specific questions.
        </p>
        
        <div className="bg-blue-50 p-3 rounded-md mb-4">
          <h4 className="font-medium text-sm mb-2">What it can do:</h4>
          <ul className="text-xs space-y-1">
            <li className="flex items-start">
              <span className="text-blue-500 mr-1.5">•</span> 
              <span>Extract key terms and obligations</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-1.5">•</span> 
              <span>Identify potential risks and issues</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-1.5">•</span> 
              <span>Answer your specific contract questions</span>
            </li>
          </ul>
        </div>
        
        <Button 
          className="w-full flex items-center justify-center gap-1"
          onClick={handleTryDemo}
        >
          Try Smart Contract Assistant <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default SmartContractPanel;
