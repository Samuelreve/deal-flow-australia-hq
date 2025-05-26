
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { ContractSkipLinks } from '@/components/contract/accessibility/EnhancedAccessibility';
import ContractPageHeaderWrapper from './ContractPageHeader';

const ContractUnauthenticatedView: React.FC = () => {
  return (
    <AppLayout>
      <ContractSkipLinks />
      <div className="container py-6 max-w-5xl">
        <ContractPageHeaderWrapper />
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Please log in to access contract analysis features.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default ContractUnauthenticatedView;
