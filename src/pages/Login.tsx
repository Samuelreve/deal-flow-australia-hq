
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
  const redirect = searchParams.get("redirect");
  
  console.log('Login page - Auth state:', {
    isAuthenticated,
    authLoading,
    hasUser: !!user,
    hasProfile: !!user?.profile,
    inviteToken
  });
  
  // Handle redirects for authenticated users
  useEffect(() => {
    // Only redirect if we're fully loaded and authenticated
    if (!authLoading && isAuthenticated && user) {
      console.log('User is authenticated, determining redirect');
      
      if (redirect) {
        console.log("Redirecting to:", redirect);
        navigate(redirect, { replace: true });
        return;
      }
      
      if (inviteToken) {
        console.log("Redirecting to accept invitation");
        navigate(`/accept-invite?token=${inviteToken}`, { replace: true });
        return;
      }
      
      // Always go to dashboard - no onboarding check
      console.log("Redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate, inviteToken]);
  
  const handleSignUp = () => {
    if (inviteToken) {
      navigate(`/signup?inviteToken=${inviteToken}`);
    } else {
      navigate("/signup");
    }
  };
  
  // Show loading only while auth is initially loading
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
  
  // If user is authenticated but still here, don't show loading
  // Let the useEffect handle the redirect
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex flex-col lg:flex-row">
      {/* Left column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 relative">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        
        <div className="w-full max-w-md relative z-10 animate-fade-in">
          <div className="mb-8 flex flex-col items-center">
            <Link to="/">
              <img src="/trustroom-logo.webp" alt="Trustroom.ai" className="h-24 md:h-28 mb-2 cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
            <p className="text-muted-foreground mt-2">
              Streamline your business exchange journey
            </p>
          </div>
          
          <LoginForm onSignUp={handleSignUp} inviteToken={inviteToken} />
        </div>
      </div>
      
      {/* Right column - Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 to-accent/10 p-8 items-center justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
        <LoginInfoPanel />
      </div>
    </div>
  );
};

export default Login;
