
import { useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // Use the main AuthContext
import { Loader2 } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import LoginInfoPanel from "@/components/auth/LoginInfoPanel";

const Login = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("inviteToken");
  
  // If already authenticated, redirect to dashboard or accept invite page
  useEffect(() => {
    if (isAuthenticated) {
      if (inviteToken) {
        console.log("User is authenticated, redirecting to accept invitation");
        navigate(`/accept-invite?token=${inviteToken}`, { replace: true });
      } else {
        console.log("User is authenticated, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, navigate, inviteToken]);
  
  const handleSignUp = () => {
    if (inviteToken) {
      navigate(`/signup?inviteToken=${inviteToken}`);
    } else {
      navigate("/signup");
    }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If already authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">
          {inviteToken 
            ? "Redirecting to accept invitation..." 
            : "Redirecting to dashboard..."}
        </span>
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
