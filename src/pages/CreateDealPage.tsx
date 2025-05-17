
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DealCreationForm from '@/components/deals/DealCreationForm';

const CreateDealPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <DealCreationForm />
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateDealPage;
