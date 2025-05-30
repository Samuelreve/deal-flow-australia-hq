
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ReviewSubmissionActionsProps {
  onPrev: () => void;
  onSubmit: () => void;
  allChecked: boolean;
  isSubmitting?: boolean;
}

export const ReviewSubmissionActions: React.FC<ReviewSubmissionActionsProps> = ({
  onPrev,
  onSubmit,
  allChecked,
  isSubmitting
}) => {
  return (
    <div className="flex justify-between pt-6">
      <Button onClick={onPrev} variant="outline" size="lg">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Button 
        onClick={onSubmit} 
        size="lg" 
        disabled={!allChecked || isSubmitting}
      >
        {isSubmitting ? 'Creating Deal...' : 'Create Deal'}
      </Button>
    </div>
  );
};
