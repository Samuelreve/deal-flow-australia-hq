
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DealCreationWizard from '@/components/deals/deal-creation/DealCreationWizard';

const CreateDealPageWizard: React.FC = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <DealCreationWizard />
      </div>
    </AppLayout>
  );
};

export default CreateDealPageWizard;
