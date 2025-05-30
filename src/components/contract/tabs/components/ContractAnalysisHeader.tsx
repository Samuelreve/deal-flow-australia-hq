
import React from 'react';
import { Brain, Zap } from 'lucide-react';

const ContractAnalysisHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <Brain className="h-5 w-5 text-primary" />
      <span>AI Contract Analysis</span>
      <Zap className="h-4 w-4 text-amber-500" />
    </div>
  );
};

export default ContractAnalysisHeader;
