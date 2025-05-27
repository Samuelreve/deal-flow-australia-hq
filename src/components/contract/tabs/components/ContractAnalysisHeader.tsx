
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search } from 'lucide-react';

const ContractAnalysisHeader: React.FC = () => {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5" />
        <h2 className="text-xl font-semibold">AI Contract Analysis</h2>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-sm text-blue-700">
          🤖 Our AI assistant will analyze your contract using advanced language models to provide insights, identify risks, and summarize key obligations.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ContractAnalysisHeader;
