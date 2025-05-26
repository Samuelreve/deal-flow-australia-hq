
import React from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import ContractSidebarContent from '@/components/contract/layout/ContractSidebarContent';
import { Contract } from '@/services/realContractService';

interface ContractSidebarWrapperProps {
  contracts: Contract[];
  selectedContract: Contract | null;
  loading: boolean;
  uploading: boolean;
  uploadProgress: number;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onContractSelect: (contractId: string) => void;
}

const ContractSidebarWrapper: React.FC<ContractSidebarWrapperProps> = (props) => {
  return (
    <div 
      id="contract-sidebar"
      className="hidden lg:block"
      tabIndex={-1}
    >
      <ErrorBoundary>
        <ContractSidebarContent {...props} />
      </ErrorBoundary>
    </div>
  );
};

export default ContractSidebarWrapper;
