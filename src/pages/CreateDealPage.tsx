
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DealCreationWizard from '@/components/deals/deal-creation/DealCreationWizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CreateDealPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/deals')}
              className="text-muted-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Deals
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Create Your Deal</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Let's get your business sale set up right. Our smart wizard will guide you through each step, 
              ensuring nothing important is missed.
            </p>
          </div>
        </div>

        <DealCreationWizard />
      </div>
    </div>
  );
};

export default CreateDealPage;
