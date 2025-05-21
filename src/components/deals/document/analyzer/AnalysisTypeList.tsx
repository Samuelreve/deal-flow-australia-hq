
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText } from "lucide-react";

interface AnalysisType {
  id: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface AnalysisTypeListProps {
  analysisTypes: AnalysisType[];
  activeTab: string;
  onTabChange: (value: string) => void;
  analysisInProgress: string | null;
}

const AnalysisTypeList: React.FC<AnalysisTypeListProps> = ({
  analysisTypes,
  activeTab,
  onTabChange,
  analysisInProgress
}) => {
  return (
    <TabsList className="mb-4">
      {analysisTypes.map(type => (
        <TabsTrigger 
          key={type.id} 
          value={type.id} 
          className="flex items-center gap-1"
        >
          {type.icon}
          {type.label}
          {analysisInProgress === type.id && (
            <Loader2 className="h-3 w-3 animate-spin ml-1" />
          )}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default AnalysisTypeList;
