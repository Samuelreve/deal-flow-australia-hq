
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface TwoFactorEnabledProps {
  setIs2faEnabled: (enabled: boolean) => void;
}

const TwoFactorEnabled: React.FC<TwoFactorEnabledProps> = ({ setIs2faEnabled }) => {
  const { user } = useAuth();
  const [isDisabling, setIsDisabling] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDisable2fa = async () => {
    if (!user) {
      toast.error('Authentication error. Cannot disable 2FA.');
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
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4 mt-1">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-green-700 mb-2">
              Two-Factor Authentication is Enabled
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your account is protected with two-factor authentication. Each time you sign in, 
              you'll need to provide a verification code from your authenticator app.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isDisabling}
                  className="flex items-center"
                >
                  {isDisabling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disabling...
                    </>
                  ) : (
                    <>
                      <ShieldOff className="mr-2 h-4 w-4" />
                      Disable 2FA
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the additional layer of security from your account. 
                    Anyone with your password will be able to access your account without 
                    requiring the verification code. Are you sure you want to disable two-factor authentication?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDisable2fa}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Disable 2FA
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoFactorEnabled;
