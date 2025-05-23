
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AppErrorBoundary from "@/components/common/AppErrorBoundary";
import OnboardingForm from "@/components/auth/OnboardingForm";

const OnboardingIntentPage: React.FC = () => {
  const { user, loading } = useAuth();

  console.log('OnboardingIntentPage:', {
    loading,
    hasUser: !!user,
    hasProfile: !!user?.profile,
    onboardingComplete: user?.profile?.onboarding_complete
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user has completed onboarding, redirect to dashboard
  if (user.profile?.onboarding_complete) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user doesn't have a profile, redirect to login to recreate it
  if (!user.profile) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <OnboardingForm />
      </div>
    </AppErrorBoundary>
  );
};

export default OnboardingIntentPage;
