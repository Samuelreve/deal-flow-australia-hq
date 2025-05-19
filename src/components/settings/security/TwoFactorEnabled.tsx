
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TwoFactorEnabledProps {
  setIs2faEnabled: (enabled: boolean) => void;
}

const TwoFactorEnabled: React.FC<TwoFactorEnabledProps> = ({ setIs2faEnabled }) => {
  const { user } = useAuth();
  const [isDisabling, setIsDisabling] = useState(false);

  const handleDisable2fa = async () => {
    if (!user) {
      toast.error('Authentication error. Cannot disable 2FA.');
      return;
    }

    // Confirm with the user before disabling
    if (!confirm('Are you sure you want to disable Two-Factor Authentication?')) {
      return;
    }

    setIsDisabling(true);

    try {
      // Fetch the user's enrolled factors to get the TOTP factor ID
      const { data, error } = await supabase.auth.mfa.listFactors();

      if (error) {
        console.error('Error listing MFA factors:', error.message);
        toast.error('Failed to retrieve 2FA factors.');
        setIsDisabling(false);
        return;
      }

      // Find the TOTP factor
      const totpFactor = data.totp?.find(factor => 
        factor.factor_type === 'totp' && factor.status === 'verified'
      );

      if (!totpFactor) {
        console.warn('TOTP factor not found despite 2FA appearing enabled.');
        setIs2faEnabled(false);
        setIsDisabling(false);
        toast.info('2FA was not found to be enabled.');
        return;
      }

      // Unenroll (disable) the TOTP factor
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: totpFactor.id,
      });

      if (unenrollError) {
        console.error('2FA Unenroll Error:', unenrollError.message);
        toast.error('Failed to disable 2FA.');
        setIsDisabling(false);
        return;
      }

      // 2FA successfully disabled
      console.log('2FA disabled successfully.');
      setIs2faEnabled(false);
      setIsDisabling(false);
      toast.success('Two-Factor Authentication disabled.');
    } catch (error: any) {
      console.error('Unexpected 2FA Disable Error:', error.message);
      toast.error('An unexpected error occurred while disabling 2FA.');
      setIsDisabling(false);
    }
  };

  return (
    <div>
      <p className="text-green-600 mb-4">Two-Factor Authentication is currently enabled.</p>
      <Button
        onClick={handleDisable2fa}
        variant="destructive"
        disabled={isDisabling}
      >
        {isDisabling ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Disabling...
          </>
        ) : "Disable 2FA"}
      </Button>
    </div>
  );
};

export default TwoFactorEnabled;
