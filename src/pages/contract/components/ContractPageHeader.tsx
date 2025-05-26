
import React from 'react';
import ContractPageHeader from '@/components/contract/ContractPageHeader';

interface ContractPageHeaderProps {
  className?: string;
}

const ContractPageHeaderWrapper: React.FC<ContractPageHeaderProps> = ({ className }) => {
  return (
    <div className={className}>
      <ContractPageHeader />
    </div>
  );
};

export default ContractPageHeaderWrapper;
