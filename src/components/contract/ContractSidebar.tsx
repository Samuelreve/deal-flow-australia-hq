
import React from 'react';
import DocumentDetails from './DocumentDetails';
import DocumentVersions from './DocumentVersions';
import RealContractUpload from './RealContractUpload';
import { DocumentMetadata, DocumentHighlight } from '@/types/contract';

interface ContractSidebarProps {
  documentMetadata: DocumentMetadata | null;
  isAnalyzing: boolean;
  documentHighlights: DocumentHighlight[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onExportHighlights: () => void;
}

const ContractSidebar: React.FC<ContractSidebarProps> = ({
  documentMetadata,
  isAnalyzing,
  documentHighlights,
  onFileUpload,
  onExportHighlights
}) => {
  console.log('ContractSidebar render:', {
    documentMetadata: documentMetadata?.name,
    isAnalyzing,
    documentHighlights: documentHighlights.length
  });

  return (
    <div className="space-y-6">
      <RealContractUpload 
        onFileUpload={onFileUpload}
        isUploading={isAnalyzing}
        uploadProgress={0}
        error={null}
      />
      
      {documentMetadata && (
        <DocumentDetails 
          metadata={documentMetadata}
          isAnalyzing={isAnalyzing}
        />
      )}
      
      <DocumentVersions 
        documentHighlights={documentHighlights}
        onExportHighlights={onExportHighlights}
        documentMetadata={documentMetadata ? {
          version: documentMetadata.version,
          versionDate: documentMetadata.versionDate
        } : undefined}
      />
    </div>
  );
};

export default ContractSidebar;
