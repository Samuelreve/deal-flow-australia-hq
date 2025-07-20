
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const OnboardingCheck: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  // Onboarding state logging removed for production

  // If auth state is still loading, show loading indicator
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, let ProtectedRoute handle it (redirect to /login)
  if (!user) {
    return <Outlet />; // ProtectedRoute should catch this and redirect
  }

  // User is authenticated, now check onboarding status from user.profile
  const hasProfile = !!user.profile;
  const onboardingComplete = user.profile?.onboarding_complete;
  const isProfessional = user.profile?.role === 'lawyer' || user.profile?.role === 'admin';
  
  // --- Onboarding Logic ---
  // Skip onboarding if user has completed it OR if they have a valid session but database issues prevent profile loading
  if (!onboardingComplete && hasProfile) {
    // If they are a professional who needs to complete their professional profile
    if (isProfessional && !user.profile?.professional_headline) {
      // Redirect to professional setup page
      return <Navigate to="/profile/professional-setup" replace />;
    } else {
      // Redirect to general intent capture page
      return <Navigate to="/onboarding/intent" replace />;
    }
  }

  // If onboarding is complete, allow access to the nested route
  // Onboarding complete, allowing access
  return <Outlet />;
};

export default OnboardingCheck;
