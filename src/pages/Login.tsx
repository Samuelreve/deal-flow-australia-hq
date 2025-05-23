
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import LoginInfoPanel from "@/components/auth/LoginInfoPanel";

const Login = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("inviteToken");
  
  console.log('Login page - Auth state:', {
    isAuthenticated,
    authLoading,
    hasUser: !!user,
    hasProfile: !!user?.profile,
    onboardingComplete: user?.profile?.onboarding_complete,
    inviteToken
  });
  
  // Handle redirects for authenticated users
  useEffect(() => {
    if (isAuthenticated && !authLoading && user) {
      console.log('User is authenticated, checking redirect logic');
      
      if (inviteToken) {
        console.log("Redirecting to accept invitation");
        navigate(`/accept-invite?token=${inviteToken}`, { replace: true });
      } else if (!user.profile || !user.profile.onboarding_complete) {
        console.log("Redirecting to onboarding");
        navigate("/onboarding/intent", { replace: true });
      } else {
        console.log("Redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, authLoading, user, navigate, inviteToken]);
  
  const handleSignUp = () => {
    if (inviteToken) {
      navigate(`/signup?inviteToken=${inviteToken}`);
    } else {
      navigate("/signup");
    }
  };
  
  // Show loading only while auth is loading, not after authentication is confirmed
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If authenticated but still on login page, show redirect loading
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {inviteToken 
              ? "Redirecting to accept invitation..." 
              : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col lg:flex-row">
      {/* Left column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">DealPilot</h1>
            <p className="text-muted-foreground mt-2">
              Streamline your business exchange journey
            </p>
          </div>
          
          <LoginForm onSignUp={handleSignUp} inviteToken={inviteToken} />
        </div>
      </div>
      
      {/* Right column - Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted p-8 items-center justify-center">
        <LoginInfoPanel />
      </div>
    </div>
  );
};

export default Login;
