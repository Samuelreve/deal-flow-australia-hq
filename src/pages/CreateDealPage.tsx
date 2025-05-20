
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DealCreationForm from '@/components/deals/DealCreationForm';
import { Shield, LockIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CreateDealPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Shield className="h-10 w-10 text-primary opacity-80" />
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Initiate New Business Deal
          </h1>
          <p className="text-muted-foreground mt-2">
            Start your secure deal process with comprehensive information that helps streamline the transaction.
          </p>
        </div>
        
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r">
          <LockIcon className="h-4 w-4" />
          <p>All information is encrypted and protected with enterprise-grade security. Your deal details will only be visible to authorized participants.</p>
        </div>
        
        <DealCreationForm />
      </div>
    </AppLayout>
  );
};

export default CreateDealPage;
