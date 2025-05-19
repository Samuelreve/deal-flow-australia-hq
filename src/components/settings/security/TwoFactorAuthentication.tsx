
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TwoFactorSetup from './TwoFactorSetup';
import TwoFactorEnabled from './TwoFactorEnabled';
import TwoFactorLoading from './TwoFactorLoading';

const TwoFactorAuthentication: React.FC = () => {
  const { user } = useAuth();
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [isEnabling2fa, setIsEnabling2fa] = useState(false);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
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
          const totpFactor = data.totp?.find(factor => 
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

    try {
      // Enroll the user for TOTP
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) {
        console.error('2FA Enrollment Error:', error.message);
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
      toast.error('An unexpected error occurred during 2FA setup.');
      setIsEnabling2fa(false);
    }
  };

  // Conditional rendering based on states
  if (loading) {
    return <TwoFactorLoading />;
  }

  if (is2faEnabled) {
    return (
      <TwoFactorEnabled 
        setIs2faEnabled={setIs2faEnabled} 
      />
    );
  }

  if (totpSecret && challengeId) {
    return (
      <TwoFactorSetup 
        totpSecret={totpSecret}
        challengeId={challengeId}
        setIs2faEnabled={setIs2faEnabled}
        setTotpSecret={setTotpSecret}
        setChallengeId={setChallengeId}
      />
    );
  }

  // Default: 2FA not enabled, showing the initial state
  return (
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
  );
};

export default TwoFactorAuthentication;
