
import SignUpForm from "@/components/auth/SignUpForm";
import { Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const SignUp = () => {
  const { isAuthenticated, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("inviteToken");
  const navigate = useNavigate();
  
  // If authenticated with invite token, redirect to accept invitation
  useEffect(() => {
    if (isAuthenticated && inviteToken) {
      navigate(`/accept-invite?token=${inviteToken}`, { replace: true });
    }
  }, [isAuthenticated, navigate, inviteToken]);
  
  // If authenticated without token, redirect to dashboard - no onboarding
  if (isAuthenticated && !inviteToken) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return <SignUpForm inviteToken={inviteToken} />;
};

export default SignUp;
