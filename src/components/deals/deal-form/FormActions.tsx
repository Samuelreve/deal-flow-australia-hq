
import React from 'react';
import { Button } from '@/components/ui/button';
import { InfoIcon, ArrowRightIcon, Loader2 } from 'lucide-react';

interface FormActionsProps {
  submitting: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ submitting }) => {
  return (
    <div className="flex flex-col items-center space-y-6 pt-8">
      <div className="flex items-center gap-2 text-muted-foreground text-sm max-w-xl text-center px-4 py-3 bg-muted/40 rounded-lg">
        <InfoIcon className="h-5 w-5 flex-shrink-0 text-primary" />
        <p>After creating your deal, you'll be able to invite participants, upload documents, and track the deal progress through our secure platform.</p>
      </div>
      
      <Button 
        type="submit" 
        className="px-8 py-6 text-base bg-gradient-to-r from-primary to-primary/90 shadow-md hover:shadow-lg transition-all"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Creating Deal...
          </>
        ) : (
          <>
            Initiate Secure Deal Process
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </div>
  );
};

export default FormActions;
