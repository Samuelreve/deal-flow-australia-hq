
import React from 'react';
import { CheckCircle } from 'lucide-react';

const AIAnalysisFeatures: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-green-900 mb-3">🤖 AI Analysis Capabilities</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span>Instant contract summaries</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span>Complex legal term explanations</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span>Risk and obligation identification</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span>Interactive Q&A assistant</span>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisFeatures;
