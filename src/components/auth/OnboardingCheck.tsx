import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Component that checks if a user needs to complete onboarding
 * and redirects them to the onboarding page if necessary
 */
const OnboardingCheck: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // If auth state is still loading, show a loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If user is authenticated but hasn't completed onboarding
  // and is not already on an onboarding path, redirect to onboarding
  const isOnboardingRoute = location.pathname.startsWith("/onboarding");
  const needsOnboarding = user && user.profile && !user.profile.onboarding_complete && !isOnboardingRoute;
  
  if (needsOnboarding) {
    // Store the intended destination to return after onboarding
    const returnTo = location.pathname !== "/" ? location.pathname : "/dashboard";
    return <Navigate to="/onboarding/intent" state={{ returnTo }} replace />;
  }
  
  // Otherwise, render the child routes
  return <Outlet />;
};

export default OnboardingCheck;
