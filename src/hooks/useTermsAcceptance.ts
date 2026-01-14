import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from '@/lib/legal-versions';
import { useToast } from '@/hooks/use-toast';

interface UseTermsAcceptanceReturn {
  needsAcceptance: boolean;
  isLoading: boolean;
  acceptTerms: () => Promise<boolean>;
  declineTerms: () => Promise<void>;
  termsVersion: string;
  privacyVersion: string;
}

export function useTermsAcceptance(): UseTermsAcceptanceReturn {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user needs to accept terms
  useEffect(() => {
    async function checkAcceptance() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Use the database function to check if acceptance is required
        const { data, error } = await supabase.rpc('check_terms_acceptance_required', {
          p_user_id: user.id,
          p_terms_version: CURRENT_TERMS_VERSION,
          p_privacy_version: CURRENT_PRIVACY_VERSION
        });

        if (error) {
          console.error('Error checking terms acceptance:', error);
          // Fallback: check profile directly
          const { data: profile } = await supabase
            .from('profiles')
            .select('terms_accepted, terms_version, privacy_accepted, privacy_version')
            .eq('id', user.id)
            .single();

          if (profile) {
            const termsNeedsUpdate = !profile.terms_accepted || profile.terms_version !== CURRENT_TERMS_VERSION;
            const privacyNeedsUpdate = !profile.privacy_accepted || profile.privacy_version !== CURRENT_PRIVACY_VERSION;
            setNeedsAcceptance(termsNeedsUpdate || privacyNeedsUpdate);
          } else {
            setNeedsAcceptance(true);
          }
        } else {
          setNeedsAcceptance(data === true);
        }
      } catch (err) {
        console.error('Error in terms acceptance check:', err);
        setNeedsAcceptance(true); // Fail safe: require acceptance
      } finally {
        setIsLoading(false);
      }
    }

    checkAcceptance();
  }, [user?.id]);

  // Accept terms and record in database
  const acceptTerms = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !user?.email) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive'
      });
      return false;
    }

    try {
      // Get IP address (best effort)
      let ipAddress: string | null = null;
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch {
        // IP fetch failed, continue without it
      }

      // Insert legal acceptance record
      const { error } = await supabase
        .from('legal_acceptances')
        .insert({
          user_id: user.id,
          email: user.email,
          terms_version: CURRENT_TERMS_VERSION,
          privacy_version: CURRENT_PRIVACY_VERSION,
          ip_address: ipAddress,
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error recording terms acceptance:', error);
        toast({
          title: 'Error',
          description: 'Failed to record your acceptance. Please try again.',
          variant: 'destructive'
        });
        return false;
      }

      setNeedsAcceptance(false);
      toast({
        title: 'Welcome to Trustroom.ai',
        description: 'Thank you for accepting our terms.',
      });
      return true;
    } catch (err) {
      console.error('Error accepting terms:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  }, [user?.id, user?.email, toast]);

  // Decline terms and log out
  const declineTerms = useCallback(async (): Promise<void> => {
    toast({
      title: 'Terms Declined',
      description: 'You must accept the terms to use Trustroom.ai. Logging out...',
      variant: 'destructive'
    });
    
    // Small delay so user sees the toast
    await new Promise(resolve => setTimeout(resolve, 1500));
    await logout();
  }, [logout, toast]);

  return {
    needsAcceptance,
    isLoading,
    acceptTerms,
    declineTerms,
    termsVersion: CURRENT_TERMS_VERSION,
    privacyVersion: CURRENT_PRIVACY_VERSION
  };
}
