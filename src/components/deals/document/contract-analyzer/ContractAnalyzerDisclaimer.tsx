
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ContractAnalyzerDisclaimerProps {
  disclaimer: string;
}

const ContractAnalyzerDisclaimer: React.FC<ContractAnalyzerDisclaimerProps> = ({
  disclaimer
}) => {
  if (!disclaimer) return null;

  return (
    <Alert className="mt-6 bg-blue-50 border-blue-200">
      <AlertDescription className="text-xs text-blue-700">
        {disclaimer}
      </AlertDescription>
    </Alert>
  );
};

export default ContractAnalyzerDisclaimer;
