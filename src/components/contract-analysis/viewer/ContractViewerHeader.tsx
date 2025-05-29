
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";

interface ContractViewerHeaderProps {
  isAnalyzing: boolean;
  analysisStage: string;
  analysisProgress: number;
}

const ContractViewerHeader: React.FC<ContractViewerHeaderProps> = ({
  isAnalyzing,
  analysisStage,
  analysisProgress
}) => {
  return (
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Contract Document
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {analysisStage} ({analysisProgress}%)
          </div>
        )}
      </CardTitle>
    </CardHeader>
  );
};

export default ContractViewerHeader;
