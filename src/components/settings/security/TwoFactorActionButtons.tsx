
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";

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
    <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
      <Button
        onClick={onVerify}
        disabled={isVerifying || isDisabled}
        variant="default"
        className="w-full flex items-center justify-center"
      >
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            Verify and Enable
          </>
        )}
      </Button>
      
      <Button
        onClick={onCancel}
        variant="outline"
        disabled={isVerifying}
        className="w-full flex items-center justify-center"
      >
        <X className="mr-2 h-4 w-4" />
        Cancel
      </Button>
    </div>
  );
};

export default TwoFactorActionButtons;
