
import React from 'react';
import { Card } from "@/components/ui/card";
import { DocumentHighlight } from '@/types/contract';
import ContractViewerHeader from './viewer/ContractViewerHeader';
import ContractViewerContent from './viewer/ContractViewerContent';

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
      <ContractViewerHeader
        isAnalyzing={isAnalyzing}
        analysisStage={analysisStage}
        analysisProgress={analysisProgress}
      />
      <ContractViewerContent contractText={contractText} />
    </Card>
  );
};

export default ContractViewer;
