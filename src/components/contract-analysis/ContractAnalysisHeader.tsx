
import React from 'react';
import { Brain, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface ContractAnalysisHeaderProps {
  aiStatus: 'checking' | 'ready' | 'error';
}

const ContractAnalysisHeader: React.FC<ContractAnalysisHeaderProps> = ({ aiStatus }) => {
  const getAiStatusIndicator = () => {
    switch (aiStatus) {
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Initializing AI...</span>
          </div>
        );
      case 'ready':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">AI Ready</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Demo Mode</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Smart Contract Analysis</h1>
              <p className="text-sm text-gray-600">AI-powered contract analysis and insights</p>
            </div>
          </div>
          {getAiStatusIndicator()}
        </div>
        
        {/* Feature Status Bar */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Document Upload</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Contract Summarization</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Term Explanation</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Q&A Assistant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractAnalysisHeader;
