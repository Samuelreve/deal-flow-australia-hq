
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History } from "lucide-react";

interface AnalyzerTabsNavProps {
  hasResult: boolean;
}

const AnalyzerTabsNav: React.FC<AnalyzerTabsNavProps> = ({ hasResult }) => {
  return (
    <TabsList>
      <TabsTrigger value="analyze">New Analysis</TabsTrigger>
      <TabsTrigger value="history">
        <History className="h-4 w-4 mr-1" />
        History
      </TabsTrigger>
      {hasResult && <TabsTrigger value="result">Current Result</TabsTrigger>}
    </TabsList>
  );
};

export default AnalyzerTabsNav;
