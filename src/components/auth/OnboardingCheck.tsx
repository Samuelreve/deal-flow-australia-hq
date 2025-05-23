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
    isProfessional: user?.profile?.is_professional,
    currentPath: location.pathname,
    userId: user?.id
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
  if (!isAuthenticated || !user) {
    console.log('OnboardingCheck: User not authenticated, passing through');
    return <>{children}</>;
  }
  
  // Check if we're on an onboarding route first
  const isOnboardingRoute = location.pathname.startsWith("/onboarding");
  
  // Skip onboarding check for auth pages (login/signup)
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup";
  
  if (isAuthRoute) {
    console.log('OnboardingCheck: On auth route, skipping onboarding check');
    return <>{children}</>;
  }
  
  // If user doesn't have a profile and is not on onboarding route
  if (!user.profile && !isOnboardingRoute) {
    console.log('OnboardingCheck: No profile found, redirecting to onboarding');
    const returnTo = location.pathname !== "/" ? location.pathname : "/dashboard";
    return <Navigate to="/onboarding/intent" state={{ returnTo }} replace />;
  }
  
  // If user has profile but hasn't completed onboarding and is not on onboarding route
  if (user.profile && !user.profile.onboarding_complete && !isOnboardingRoute) {
    console.log('OnboardingCheck: Incomplete onboarding, redirecting');
    
    // Special case: if user is a professional but trying to access non-profile pages,
    // redirect them to complete their professional profile
    if (user.profile.is_professional && location.pathname !== "/profile") {
      console.log('OnboardingCheck: Professional user needs to complete profile');
      return <Navigate to="/profile" state={{ returnTo: location.pathname }} replace />;
    }
    
    const returnTo = location.pathname !== "/" ? location.pathname : "/dashboard";
    return <Navigate to="/onboarding/intent" state={{ returnTo }} replace />;
  }
  
  // Otherwise, render the child routes
  return <>{children}</>;
};

export default OnboardingCheck;
