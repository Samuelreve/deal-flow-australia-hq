
import React from 'react';
import ContractMobileHeader from '@/components/contract/mobile/ContractMobileHeader';
import { Contract } from '@/services/realContractService';

interface ContractMobileViewProps {
  selectedContract: Contract | null;
  children: React.ReactNode;
}

const ContractMobileView: React.FC<ContractMobileViewProps> = ({
  selectedContract,
  children
}) => {
  return (
    <ContractMobileHeader selectedContract={selectedContract}>
      {children}
    </ContractMobileHeader>
  );
};

export default ContractMobileView;
