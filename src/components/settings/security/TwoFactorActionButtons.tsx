
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TwoFactorActionButtonsProps {
  onVerify: () => void;
  onCancel: () => void;
  isVerifying: boolean;
  isDisabled: boolean;
}

const TwoFactorActionButtons: React.FC<TwoFactorActionButtonsProps> = ({
  onVerify,
  onCancel,
  isVerifying,
  isDisabled,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <Button
        onClick={onVerify}
        disabled={isVerifying || isDisabled}
        variant="default"
      >
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : "Verify and Enable"}
      </Button>
      
      <Button
        onClick={onCancel}
        variant="outline"
        disabled={isVerifying}
      >
        Cancel
      </Button>
    </div>
  );
};

export default TwoFactorActionButtons;
