
import React from 'react';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIToolMainProps {
  onSelectTool: (tool: string) => void;
}

const AIToolMain: React.FC<AIToolMainProps> = ({ onSelectTool }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
      <Button 
        onClick={() => onSelectTool('summarize_deal')}
        variant="outline" 
        className="h-24 flex flex-col items-center justify-center gap-2"
      >
        <Brain className="h-8 w-8 text-primary" />
        <span>Summarize Deal</span>
      </Button>
      
      <Button 
        onClick={() => onSelectTool('predict_deal_health')}
        variant="outline" 
        className="h-24 flex flex-col items-center justify-center gap-2"
      >
        <Brain className="h-8 w-8 text-primary" />
        <span>Predict Deal Health</span>
      </Button>
      
      <Button 
        onClick={() => onSelectTool('summarize_document')}
        variant="outline" 
        className="h-24 flex flex-col items-center justify-center gap-2"
      >
        <Brain className="h-8 w-8 text-primary" />
        <span>Document Summary</span>
      </Button>
      
      <Button 
        onClick={() => onSelectTool('explain_clause')}
        variant="outline" 
        className="h-24 flex flex-col items-center justify-center gap-2"
      >
        <Brain className="h-8 w-8 text-primary" />
        <span>Explain Text</span>
      </Button>
      
      <Button 
        onClick={() => onSelectTool('summarize_contract')}
        variant="outline" 
        className="h-24 flex flex-col items-center justify-center gap-2"
      >
        <Brain className="h-8 w-8 text-primary" />
        <span>Contract Summary</span>
      </Button>
      
      <Button 
        onClick={() => onSelectTool('explain_contract_clause')}
        variant="outline" 
        className="h-24 flex flex-col items-center justify-center gap-2"
      >
        <Brain className="h-8 w-8 text-primary" />
        <span>Explain Contract Clause</span>
      </Button>
    </div>
  );
};

export default AIToolMain;
