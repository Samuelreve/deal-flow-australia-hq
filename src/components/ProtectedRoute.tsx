
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = "/login" 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute check:', {
    isAuthenticated,
    loading,
    hasUser: !!user,
    hasProfile: !!user?.profile,
    onboardingComplete: user?.profile?.onboarding_complete,
    currentPath: location.pathname
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('ProtectedRoute: Redirecting to login - not authenticated');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user is authenticated but trying to access auth pages, redirect appropriately
  if (isAuthenticated && (location.pathname === "/login" || location.pathname === "/signup")) {
    // Check if user needs onboarding
    if (!user?.profile || !user.profile.onboarding_complete) {
      console.log('ProtectedRoute: Redirecting to onboarding from auth page');
      return <Navigate to="/onboarding/intent" replace />;
    }
    console.log('ProtectedRoute: Redirecting to dashboard from auth page');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Error boundary component for authentication errors
export const AuthErrorBoundary: React.FC<{ 
  error?: string; 
  onRetry?: () => void;
}> = ({ error, onRetry }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-600">Authentication Error</CardTitle>
          <CardDescription>
            {error || "There was a problem verifying your authentication. Please try again."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProtectedRoute;
