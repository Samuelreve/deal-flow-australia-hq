
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4 mt-1">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">Enhance Your Account Security</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Two-Factor Authentication adds an extra layer of security to your account. 
              When enabled, you'll need to provide a verification code from your authenticator app 
              in addition to your password when signing in.
            </p>
            
            <Button
              onClick={handleEnable2faClick}
              disabled={isEnabling2fa}
              className="flex items-center"
            >
              {isEnabling2fa ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Enable 2FA
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuthentication;
