
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

  // Authentication state logging removed for production

  // Show loading only when actually loading, with timeout
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirecting to login - not authenticated
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Don't redirect authenticated users away from login/signup pages
  // Let them access these pages if they want to (e.g., to logout or switch accounts)
  
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
