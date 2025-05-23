
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AUTH_ROUTES } from "@/contexts/auth/constants";
import { handleAuthError } from "@/contexts/auth/authUtils";
import { useToast } from "@/hooks/use-toast";

interface LoginFormValues {
  email: string;
  password: string;
}

export const useLoginForm = () => {
  const { login, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [needs2fa, setNeeds2fa] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const handleLoginSubmit = async (email: string, password: string) => {
    setErrorMsg("");
    setIsLoading(true);
    
    // Show loading toast
    toast({
      title: "Signing in...",
      description: "Please wait while we verify your credentials.",
    });
    
    try {
      const success = await login(email, password);
      
      if (success) {
        setShowSuccess(true);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        
        // Get the intended destination from location state or default to dashboard
        const from = location.state?.from?.pathname || AUTH_ROUTES.DASHBOARD;
        
        // Small delay to show success state
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
        
        return true;
      } else {
        const errorMessage = "Invalid email or password. Please check your credentials and try again.";
        setErrorMsg(errorMessage);
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: errorMessage,
        });
        return false;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.message || "Login failed. Please try again.";
      setErrorMsg(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: errorMessage,
      });
      
      handleAuthError(error, toast);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (formValues: LoginFormValues) => {
    await handleLoginSubmit(formValues.email, formValues.password);
  };

  const handleVerify2faCode = async (code: string) => {
    // Placeholder for 2FA verification
    setNeeds2fa(false);
    return true;
  };

  const handleCancelTwoFactor = () => {
    setNeeds2fa(false);
    setChallengeId(null);
  };

  const handleForgotPassword = () => {
    setShowResetPassword(true);
    toast({
      title: "Password Reset",
      description: "Enter your email address to receive reset instructions.",
    });
  };

  const handleCancelResetPassword = () => {
    setShowResetPassword(false);
  };

  return {
    form,
    onSubmit,
    errorMsg,
    isLoading: isLoading || authLoading,
    error: errorMsg,
    showSuccess,
    showResetPassword,
    needs2fa,
    challengeId,
    handleLoginSubmit,
    handleVerify2faCode,
    handleCancelTwoFactor,
    handleForgotPassword,
    handleCancelResetPassword
  };
};
