
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from 'qrcode.react';

interface TwoFactorSetupProps {
  totpSecret: string;
  challengeId: string;
  setIs2faEnabled: (enabled: boolean) => void;
  setTotpSecret: (secret: string | null) => void;
  setChallengeId: (id: string | null) => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  totpSecret,
  challengeId,
  setIs2faEnabled,
  setTotpSecret,
  setChallengeId,
}) => {
  const { user } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying2fa, setIsVerifying2fa] = useState(false);
  const [enableError, setEnableError] = useState<string | null>(null);

  // Construct the otpauth URL for the QR code
  const appName = 'DealPilot';
  const userEmail = user?.profile?.email || '';
  const otpAuthUrl = `otpauth://totp/${appName}:${userEmail}?secret=${totpSecret}&issuer=${appName}`;

  const handleVerify2faSetup = async () => {
    if (!challengeId || !verificationCode) {
      setEnableError('Please enter the verification code.');
      return;
    }

    setIsVerifying2fa(true);
    setEnableError(null);

    try {
      // Verify the code against the challenge
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: challengeId,
      });

      if (error) {
        console.error('2FA Challenge Error:', error.message);
        setEnableError('Failed to create challenge. Please try again.');
        toast.error('2FA verification failed.');
        setIsVerifying2fa(false);
        return;
      }

      // Now verify the code
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: challengeId,
        challengeId: data.id,
        code: verificationCode,
      });

      if (verifyError) {
        console.error('2FA Verification Error:', verifyError.message);
        setEnableError('Invalid code. Please try again.');
        toast.error('2FA verification failed.');
        setIsVerifying2fa(false);
        return;
      }

      // Verification successful! 2FA is now enabled.
      console.log('2FA setup verified successfully:', verifyData);
      setIs2faEnabled(true);
      setTotpSecret(null);
      setChallengeId(null);
      setVerificationCode('');
      setIsVerifying2fa(false);
      toast.success('Two-Factor Authentication enabled successfully!');
    } catch (error: any) {
      console.error('Unexpected 2FA Verification Error:', error.message);
      setEnableError(error.message);
      toast.error('An unexpected error occurred during 2FA verification.');
      setIsVerifying2fa(false);
    }
  };

  const handleCancel = () => {
    setTotpSecret(null);
    setChallengeId(null);
    setVerificationCode('');
    setEnableError(null);
  };

  return (
    <div className="space-y-4">
      <p className="mb-4">
        Scan the QR code with your authenticator app (like Google Authenticator or Authy), 
        or manually enter the secret key.
      </p>
      
      <div className="flex flex-col items-center mb-4">
        <div className="mb-4 p-2 border rounded-md bg-white">
          <QRCode value={otpAuthUrl} size={160} level="H" />
        </div>
        
        <div className="w-full mt-2">
          <p className="text-xs mb-1">Secret key (for manual entry):</p>
          <p className="text-sm font-mono bg-muted p-2 rounded-md break-all text-center">
            {totpSecret}
          </p>
        </div>
      </div>

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
          disabled={isVerifying2fa}
        />
      </div>

      {enableError && (
        <p className="text-destructive text-sm">{enableError}</p>
      )}

      <div className="flex flex-col space-y-2">
        <Button
          onClick={handleVerify2faSetup}
          disabled={isVerifying2fa || verificationCode.length !== 6}
          variant="default"
        >
          {isVerifying2fa ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : "Verify and Enable"}
        </Button>
        
        <Button
          onClick={handleCancel}
          variant="outline"
          disabled={isVerifying2fa}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default TwoFactorSetup;
