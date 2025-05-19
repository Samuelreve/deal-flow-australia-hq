
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import QRCode from 'qrcode.react';

const AccountSecuritySection: React.FC = () => {
  const { user } = useAuth();
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [isEnabling2fa, setIsEnabling2fa] = useState(false);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying2fa, setIsVerifying2fa] = useState(false);
  const [enableError, setEnableError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if 2FA is already enabled
  useEffect(() => {
    const check2faStatus = async () => {
      if (user) {
        try {
          const { data, error } = await supabase.auth.mfa.listFactors();
          
          if (error) {
            console.error('Error checking 2FA status:', error.message);
            setLoading(false);
            return;
          }
          
          // Check if TOTP factor is verified/enabled
          const totpFactor = data.factors?.find(factor => 
            factor.factor_type === 'totp' && factor.status === 'verified'
          );
          
          setIs2faEnabled(!!totpFactor);
          setLoading(false);
        } catch (error) {
          console.error('Unexpected error checking 2FA status:', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    check2faStatus();
  }, [user]);

  const handleEnable2faClick = async () => {
    setIsEnabling2fa(true);
    setEnableError(null);

    try {
      // Enroll the user for TOTP
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) {
        console.error('2FA Enrollment Error:', error.message);
        setEnableError(error.message);
        toast.error('Failed to initiate 2FA setup.');
        setIsEnabling2fa(false);
        return;
      }

      // Store the secret and challenge ID
      setTotpSecret(data.totp.secret);
      setChallengeId(data.id);

      // Set state to show the verification step
      setIsEnabling2fa(false);
    } catch (error: any) {
      console.error('Unexpected 2FA Enrollment Error:', error.message);
      setEnableError(error.message);
      toast.error('An unexpected error occurred during 2FA setup.');
      setIsEnabling2fa(false);
    }
  };

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
        code: verificationCode,
      });

      if (error) {
        console.error('2FA Verification Error:', error.message);
        setEnableError('Invalid code. Please try again.');
        toast.error('2FA verification failed.');
        setIsVerifying2fa(false);
        return;
      }

      // Verification successful! 2FA is now enabled.
      console.log('2FA setup verified successfully:', data);
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

  const handleDisable2fa = async () => {
    if (!user) {
      toast.error('Authentication error. Cannot disable 2FA.');
      return;
    }

    // Confirm with the user before disabling
    if (!confirm('Are you sure you want to disable Two-Factor Authentication?')) {
      return;
    }

    setIsVerifying2fa(true);
    setEnableError(null);

    try {
      // Fetch the user's enrolled factors to get the TOTP factor ID
      const { data, error } = await supabase.auth.mfa.listFactors();

      if (error) {
        console.error('Error listing MFA factors:', error.message);
        setEnableError(error.message);
        toast.error('Failed to retrieve 2FA factors.');
        setIsVerifying2fa(false);
        return;
      }

      // Find the TOTP factor
      const totpFactor = data.factors?.find(factor => 
        factor.factor_type === 'totp' && factor.status === 'verified'
      );

      if (!totpFactor) {
        console.warn('TOTP factor not found despite 2FA appearing enabled.');
        setIs2faEnabled(false);
        setIsVerifying2fa(false);
        toast.info('2FA was not found to be enabled.');
        return;
      }

      // Unenroll (disable) the TOTP factor
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: totpFactor.id,
      });

      if (unenrollError) {
        console.error('2FA Unenroll Error:', unenrollError.message);
        setEnableError(unenrollError.message);
        toast.error('Failed to disable 2FA.');
        setIsVerifying2fa(false);
        return;
      }

      // 2FA successfully disabled
      console.log('2FA disabled successfully.');
      setIs2faEnabled(false);
      setIsVerifying2fa(false);
      toast.success('Two-Factor Authentication disabled.');
    } catch (error: any) {
      console.error('Unexpected 2FA Disable Error:', error.message);
      setEnableError(error.message);
      toast.error('An unexpected error occurred while disabling 2FA.');
      setIsVerifying2fa(false);
    }
  };

  // Construct the otpauth URL for the QR code
  const appName = 'DealPilot';
  const userEmail = user?.profile?.email || '';
  const otpAuthUrl = totpSecret 
    ? `otpauth://totp/${appName}:${userEmail}?secret=${totpSecret}&issuer=${appName}` 
    : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Two-Factor Authentication (2FA)</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Add an extra layer of security to your account by enabling two-factor authentication
      </p>

      <Card>
        <CardContent className="pt-6">
          {is2faEnabled ? (
            <div>
              <p className="text-green-600 mb-4">Two-Factor Authentication is currently enabled.</p>
              <Button
                onClick={handleDisable2fa}
                variant="destructive"
                disabled={isVerifying2fa}
              >
                {isVerifying2fa ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disabling...
                  </>
                ) : "Disable 2FA"}
              </Button>
            </div>
          ) : (
            <div>
              {!totpSecret ? (
                <div className="space-y-4">
                  <p>Enhance your account security by enabling Two-Factor Authentication.</p>
                  <Button
                    onClick={handleEnable2faClick}
                    disabled={isEnabling2fa}
                  >
                    {isEnabling2fa ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enabling...
                      </>
                    ) : "Enable 2FA"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="mb-4">
                    Scan the QR code with your authenticator app (like Google Authenticator or Authy), 
                    or manually enter the secret key.
                  </p>
                  
                  <div className="flex flex-col items-center mb-4">
                    {otpAuthUrl && (
                      <div className="mb-4 p-2 border rounded-md bg-white">
                        <QRCode value={otpAuthUrl} size={160} level="H" />
                      </div>
                    )}
                    
                    {totpSecret && (
                      <div className="w-full mt-2">
                        <p className="text-xs mb-1">Secret key (for manual entry):</p>
                        <p className="text-sm font-mono bg-muted p-2 rounded-md break-all text-center">
                          {totpSecret}
                        </p>
                      </div>
                    )}
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
                      onClick={() => { 
                        setTotpSecret(null); 
                        setChallengeId(null); 
                        setVerificationCode(''); 
                        setEnableError(null); 
                      }}
                      variant="outline"
                      disabled={isVerifying2fa}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSecuritySection;
