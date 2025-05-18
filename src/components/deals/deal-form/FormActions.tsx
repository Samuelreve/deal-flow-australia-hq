
import React from 'react';
import { Button } from '@/components/ui/button';
import { InfoIcon, ArrowRightIcon } from 'lucide-react';

interface FormActionsProps {
  submitting: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ submitting }) => {
  return (
    <div className="flex flex-col items-center space-y-4 pt-4">
      <div className="flex items-center gap-2 text-muted-foreground text-sm max-w-xl text-center">
        <InfoIcon className="h-4 w-4 flex-shrink-0" />
        <p>After creating your deal, you'll be able to invite participants, upload documents, and track the deal progress through our secure platform.</p>
      </div>
      
      <Button 
        type="submit" 
        className="px-8 py-6 text-base"
        disabled={submitting}
      >
        {submitting ? 'Creating Deal...' : 'Initiate Secure Deal Process'}
        {!submitting && <ArrowRightIcon className="ml-2 h-5 w-5" />}
      </Button>
    </div>
  );
};

export default FormActions;
