
import React from 'react';
import { HandHeart, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DealInfoHeader: React.FC = () => {
  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <HandHeart className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Tell us about this deal</h2>
      </div>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          This information will help potential buyers understand your business and make informed decisions.
        </AlertDescription>
      </Alert>
    </>
  );
};
