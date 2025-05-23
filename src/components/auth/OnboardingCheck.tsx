
import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface OnboardingCheckProps {
  children: ReactNode;
}

/**
 * Component that checks if a user needs to complete onboarding
 * and redirects them to the onboarding page if necessary
 */
const OnboardingCheck: React.FC<OnboardingCheckProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  
  console.log('OnboardingCheck:', {
    isAuthenticated,
    loading,
    hasProfile: !!user?.profile,
    onboardingComplete: user?.profile?.onboarding_complete,
    currentPath: location.pathname
  });
  
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
  
  // If user is authenticated but hasn't completed onboarding
  // and is not already on an onboarding path, redirect to onboarding
  const isOnboardingRoute = location.pathname.startsWith("/onboarding");
  const needsOnboarding = user && user.profile && !user.profile.onboarding_complete && !isOnboardingRoute;
  
  if (needsOnboarding) {
    console.log('Redirecting to onboarding - incomplete onboarding');
    // Store the intended destination to return after onboarding
    const returnTo = location.pathname !== "/" ? location.pathname : "/dashboard";
    return <Navigate to="/onboarding/intent" state={{ returnTo }} replace />;
  }
  
  // Otherwise, render the child routes
  return <>{children}</>;
};

export default OnboardingCheck;
