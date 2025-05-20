
import React from 'react';
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface VerificationCodeInputProps {
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  isVerifying: boolean;
  error: string | null;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  verificationCode,
  setVerificationCode,
  isVerifying,
  error,
}) => {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-sm font-medium block" htmlFor="verification-code">
          Enter the 6-digit code from your authenticator app
        </Label>
        <p className="text-xs text-muted-foreground">
          Open your authenticator app to view your verification code
        </p>
      </div>
      
      <div className="flex justify-center py-2">
        <InputOTP
          maxLength={6}
          value={verificationCode}
          onChange={setVerificationCode}
          disabled={isVerifying}
          render={({ slots }) => (
            <InputOTPGroup>
              {slots.map((slot, index) => (
                <InputOTPSlot key={index} {...slot} index={index} />
              ))}
            </InputOTPGroup>
          )}
        />
      </div>
      
      {error && (
        <p className="text-destructive text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default VerificationCodeInput;
