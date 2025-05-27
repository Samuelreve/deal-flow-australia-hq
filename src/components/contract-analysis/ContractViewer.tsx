
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";
import { DocumentHighlight } from '@/types/contract';

interface ContractViewerProps {
  contractText: string;
  documentHighlights: DocumentHighlight[];
  setDocumentHighlights: React.Dispatch<React.SetStateAction<DocumentHighlight[]>>;
  isAnalyzing: boolean;
  analysisStage: string;
  analysisProgress: number;
}

const ContractViewer: React.FC<ContractViewerProps> = ({
  contractText,
  documentHighlights,
  setDocumentHighlights,
  isAnalyzing,
  analysisStage,
  analysisProgress
}) => {
  return (
    <Card className="h-full">
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
      <CardContent>
        <div className="bg-white border rounded-lg p-6 max-h-[600px] overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {contractText}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractViewer;
