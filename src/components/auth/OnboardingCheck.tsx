
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const OnboardingCheck: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  console.log('OnboardingCheck state:', {
    authLoading,
    hasUser: !!user,
    hasProfile: !!user?.profile,
    onboardingComplete: user?.profile?.onboarding_complete,
    userRole: user?.profile?.role
  });

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
  
  console.log('OnboardingCheck decision factors:', {
    hasProfile,
    onboardingComplete,
    isProfessional,
    professionalHeadline: user.profile?.professional_headline
  });

  // --- Onboarding Logic ---
  if (!hasProfile || !onboardingComplete) {
    // If profile doesn't exist OR onboarding_complete is false
    // And if they are a professional who needs to complete their professional profile
    if (isProfessional && hasProfile && !user.profile?.professional_headline) {
      // Redirect to professional setup page
      console.log('OnboardingCheck: Redirecting to professional setup');
      return <Navigate to="/profile/professional-setup" replace />;
    } else {
      // Redirect to general intent capture page
      console.log('OnboardingCheck: Redirecting to intent capture');
      return <Navigate to="/onboarding/intent" replace />;
    }
  }

  // If onboarding is complete, allow access to the nested route
  console.log('OnboardingCheck: Onboarding complete, allowing access');
  return <Outlet />;
};

export default OnboardingCheck;
