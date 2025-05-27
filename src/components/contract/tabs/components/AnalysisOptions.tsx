
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileText, Search, Sparkles } from 'lucide-react';

interface AnalysisOptionsProps {
  onAnalysisSelect: (analysisType: string) => Promise<void>;
  isProcessing: boolean;
}

const AnalysisOptions: React.FC<AnalysisOptionsProps> = ({
  onAnalysisSelect,
  isProcessing
}) => {
  const analysisOptions = [
    {
      id: 'summary',
      title: 'Contract Summary',
      description: 'Get an AI-generated overview of the entire contract',
      icon: Search,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'risks',
      title: 'Risk Analysis',
      description: 'Identify potential risks and concerning clauses',
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'obligations',
      title: 'Key Obligations',
      description: 'Extract important duties and responsibilities',
      icon: FileText,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <h3 className="text-sm font-medium text-gray-900">Quick AI Analysis</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {analysisOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Button
              key={option.id}
              variant="outline"
              className="h-auto p-3 flex flex-col items-start space-y-2 hover:shadow-md transition-all duration-200"
              onClick={() => onAnalysisSelect(option.id)}
              disabled={isProcessing}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                <IconComponent className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{option.title}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisOptions;
