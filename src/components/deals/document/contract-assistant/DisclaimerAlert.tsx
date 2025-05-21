
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DisclaimerAlertProps {
  disclaimer: string;
}

const DisclaimerAlert: React.FC<DisclaimerAlertProps> = ({ disclaimer }) => {
  if (!disclaimer) return null;
  
  return (
    <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200 text-xs">
      <AlertTriangle className="h-3 w-3 text-blue-600" />
      <AlertDescription className="text-xs">
        {disclaimer}
      </AlertDescription>
    </Alert>
  );
};

export default DisclaimerAlert;
