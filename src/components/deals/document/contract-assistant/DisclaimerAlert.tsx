
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DisclaimerAlertProps {
  disclaimer: string;
}

const DisclaimerAlert: React.FC<DisclaimerAlertProps> = ({ disclaimer }) => {
  if (!disclaimer) return null;
  
  return (
    <Alert className="mt-6 bg-blue-50 border-blue-200">
      <AlertDescription className="text-xs text-blue-700">
        {disclaimer}
      </AlertDescription>
    </Alert>
  );
};

export default DisclaimerAlert;
