
import React from 'react';
import DocumentDetails from './DocumentDetails';
import DocumentVersions from './DocumentVersions';
import RealContractUpload from './RealContractUpload';
import { DocumentMetadata, DocumentHighlight } from '@/types/contract';
import { useContractDocumentUpload } from '@/hooks/contract/useContractDocumentUpload';

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
  const { isUploading, uploadProgress, error } = useContractDocumentUpload({
    onUploadSuccess: (metadata, text, summary) => {
      console.log('Upload successful:', metadata);
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
    }
  });

  return (
    <div className="space-y-6">
      <RealContractUpload 
        onFileUpload={onFileUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        error={error}
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
