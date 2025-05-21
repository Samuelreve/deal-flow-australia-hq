
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AIToolSelectorProps {
  activeTab: string;
  activeOperation: string;
  onBackClick: () => void;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const AIToolSelector: React.FC<AIToolSelectorProps> = ({
  activeTab,
  activeOperation,
  onBackClick,
  onTabChange,
  children
}) => {
  // Get operation title based on the active operation
  const getOperationTitle = () => {
    switch (activeOperation) {
      case 'summarize_deal':
        return 'Summarize Deal';
      case 'predict_deal_health':
        return 'Predict Deal Health';
      case 'summarize_document':
        return 'Document Summary';
      case 'explain_clause':
        return 'Explain Text';
      case 'summarize_contract':
        return 'Contract Summary';
      case 'explain_contract_clause':
        return 'Explain Contract Clause';
      default:
        return 'AI Assistant';
    }
  };

  // Determine if we need to show the document tab
  const showDocumentTab = ['summarize_document', 'explain_clause', 'summarize_contract', 'explain_contract_clause'].includes(activeOperation);

  return (
    <div className="flex flex-col space-y-4 py-4">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={onBackClick}
          className="p-0 h-8 mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">{getOperationTitle()}</h3>
      </div>
      
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className={`grid ${showDocumentTab ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <TabsTrigger value="deals">Select Deal</TabsTrigger>
          {showDocumentTab && (
            <TabsTrigger value="documents">Select Document</TabsTrigger>
          )}
        </TabsList>
        
        {children}
      </Tabs>
    </div>
  );
};

export default AIToolSelector;
