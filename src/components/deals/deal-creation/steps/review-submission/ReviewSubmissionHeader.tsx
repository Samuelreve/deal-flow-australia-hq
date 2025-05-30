
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ReviewSubmissionHeader: React.FC = () => {
  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <CheckCircle className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Review & Submit</h2>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Please review all information carefully. Once submitted, your deal will be created 
          in draft status and you can make further edits from the deal dashboard.
        </AlertDescription>
      </Alert>
    </>
  );
};
