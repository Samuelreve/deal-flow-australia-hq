
import React from 'react';
import { Card } from "@/components/ui/card";
import { Loader } from 'lucide-react';

const ContractAnalyzingState: React.FC = () => {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Analyzing your contract...</h3>
          <p className="text-muted-foreground">
            Our AI is reviewing the document to provide insights and summaries
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ContractAnalyzingState;
