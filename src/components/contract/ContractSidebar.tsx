
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import DocumentDetails from './DocumentDetails';
import DocumentVersions from './DocumentVersions';

interface ContractSidebarProps {
  documentMetadata: any;
  isAnalyzing: boolean;
  documentHighlights: any[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportHighlights: () => void;
}

const ContractSidebar: React.FC<ContractSidebarProps> = ({
  documentMetadata,
  isAnalyzing,
  documentHighlights,
  onFileUpload,
  onExportHighlights
}) => {
  return (
    <div className="space-y-6">
      {/* Document Details Card */}
      <DocumentDetails 
        documentMetadata={documentMetadata}
        isAnalyzing={isAnalyzing}
        onFileUpload={onFileUpload}
      />
      
      {/* Document Versions */}
      <DocumentVersions documentMetadata={documentMetadata} />
      
      {/* Export Highlights Button */}
      {documentHighlights.length > 0 && (
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2" 
          onClick={onExportHighlights}
        >
          <Download className="h-4 w-4" />
          Export Highlights ({documentHighlights.length})
        </Button>
      )}
    </div>
  );
};

export default ContractSidebar;
