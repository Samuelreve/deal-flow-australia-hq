import React from 'react';
import { useTermsAcceptance } from '@/hooks/useTermsAcceptance';
import { TermsAcceptanceModal } from '@/components/legal/TermsAcceptanceModal';
import { Loader2 } from 'lucide-react';

interface TermsAcceptanceCheckProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that checks if the user has accepted the current
 * Terms & Conditions and Privacy Policy versions.
 * 
 * Shows a blocking modal if acceptance is required.
 */
export function TermsAcceptanceCheck({ children }: TermsAcceptanceCheckProps) {
  const {
    needsAcceptance,
    isLoading,
    acceptTerms,
    declineTerms,
    termsVersion,
    privacyVersion
  } = useTermsAcceptance();

  // Show loading state while checking acceptance status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Checking account status...</p>
        </div>
      </div>
    );
  }

  // Show modal if user needs to accept terms
  if (needsAcceptance) {
    return (
      <>
        {/* Render a blurred/blocked background */}
        <div className="min-h-screen bg-background opacity-50 pointer-events-none">
          {children}
        </div>
        
        <TermsAcceptanceModal
          open={true}
          termsVersion={termsVersion}
          privacyVersion={privacyVersion}
          onAccept={acceptTerms}
          onDecline={declineTerms}
        />
      </>
    );
  }

  // User has accepted, render children normally
  return <>{children}</>;
}

export default TermsAcceptanceCheck;
