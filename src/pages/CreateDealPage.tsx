
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DealCreationForm from '@/components/deals/DealCreationForm';
import { Shield, LockIcon } from 'lucide-react';

const CreateDealPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Initiate New Business Deal</h1>
            <p className="text-muted-foreground mt-2">
              Start your secure deal process with comprehensive information that helps streamline the transaction.
            </p>
          </div>
          <Shield className="h-12 w-12 text-primary opacity-70" />
        </div>
        
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground border-l-4 border-primary pl-4 py-2 bg-primary/5">
          <LockIcon className="h-4 w-4" />
          <p>All information is encrypted and protected with enterprise-grade security. Your deal details will only be visible to authorized participants.</p>
        </div>
        
        <DealCreationForm />
      </div>
    </AppLayout>
  );
};

export default CreateDealPage;
