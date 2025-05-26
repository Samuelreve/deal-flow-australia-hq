
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner } from '@/components/ui/spinner';

const ContractLoadingView: React.FC = () => {
  return (
    <AppLayout>
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading contracts...</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default ContractLoadingView;
