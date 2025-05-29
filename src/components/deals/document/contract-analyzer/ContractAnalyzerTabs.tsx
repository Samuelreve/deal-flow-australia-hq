
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContractAnalyzerTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

const ContractAnalyzerTabs: React.FC<ContractAnalyzerTabsProps> = ({
  activeTab,
  setActiveTab,
  children
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="explanation">Explain Text</TabsTrigger>
        <TabsTrigger value="askQuestion">Ask a Question</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export default ContractAnalyzerTabs;
