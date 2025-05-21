
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DisclaimerFooterProps {
  result: any;
}

const DisclaimerFooter: React.FC<DisclaimerFooterProps> = ({ result }) => {
  if (!result) return null;
  
  return (
    <Alert className="mt-6 bg-muted/50">
      <AlertDescription className="text-xs text-muted-foreground">
        This analysis is AI-generated and provided for informational purposes only. It is not legal or professional advice and should be reviewed by qualified professionals.
      </AlertDescription>
    </Alert>
  );
};

export default DisclaimerFooter;
