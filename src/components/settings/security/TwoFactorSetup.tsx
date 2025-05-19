
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import TwoFactorQRCode from './TwoFactorQRCode';
import VerificationCodeInput from './VerificationCodeInput';
import TwoFactorActionButtons from './TwoFactorActionButtons';

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
      
      <TwoFactorQRCode otpAuthUrl={otpAuthUrl} totpSecret={totpSecret} />

      <VerificationCodeInput
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        isVerifying={isVerifying2fa}
        error={enableError}
      />

      <TwoFactorActionButtons
        onVerify={handleVerify2faSetup}
        onCancel={handleCancel}
        isVerifying={isVerifying2fa}
        isDisabled={verificationCode.length !== 6}
      />
    </div>
  );
};

export default TwoFactorSetup;
