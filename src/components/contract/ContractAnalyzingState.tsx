
import React from 'react';
import { Card } from "@/components/ui/card";
import { Loader } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface ContractAnalyzingStateProps {
  stage?: string;
  progress?: number;
}

const ContractAnalyzingState: React.FC<ContractAnalyzingStateProps> = ({ 
  stage = "Analyzing your contract...", 
  progress = 50 
}) => {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <div className="space-y-2">
          <h3 className="text-xl font-medium">{stage}</h3>
          <p className="text-muted-foreground">
            Our AI is reviewing the document to provide insights and summaries
          </p>
        </div>
        <div className="w-full max-w-md">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
        </div>
      </div>
    </Card>
  );
};

export default ContractAnalyzingState;
