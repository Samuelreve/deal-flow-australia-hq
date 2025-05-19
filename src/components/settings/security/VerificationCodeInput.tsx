
import React from 'react';

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
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor="verification-code">
        Enter Code from App
      </label>
      <input
        type="text"
        id="verification-code"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-center"
        placeholder="000000"
        maxLength={6}
        disabled={isVerifying}
      />
      
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
    </div>
  );
};

export default VerificationCodeInput;
