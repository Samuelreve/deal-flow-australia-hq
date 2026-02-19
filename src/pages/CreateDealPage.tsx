
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DealCreationWizard from '@/components/deals/deal-creation/DealCreationWizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CreateDealPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/deals')}
              className="text-muted-foreground text-xs sm:text-sm"
            >
              <ArrowLeft className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Back to </span>Deals
            </Button>
          </div>
          
          <div className="text-center px-2">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Create Your Deal</h1>
            <p className="text-sm sm:text-xl text-muted-foreground max-w-2xl mx-auto">
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
