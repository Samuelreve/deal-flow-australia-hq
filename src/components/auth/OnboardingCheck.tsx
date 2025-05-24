
import React, { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface OnboardingCheckProps {
  children: ReactNode;
}

/**
 * Component that no longer checks for onboarding - allows all authenticated users through
 */
const OnboardingCheck: React.FC<OnboardingCheckProps> = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();
  
  // If auth state is still loading, show a loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If not authenticated, let ProtectedRoute handle it
  if (!isAuthenticated) {
    return <>{children}</>;
  }
  
  // Always render children - no onboarding checks
  return <>{children}</>;
};

export default OnboardingCheck;
