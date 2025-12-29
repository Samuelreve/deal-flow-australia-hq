
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
    
    
    
    try {
      const success = await login(email, password);
      
      if (success) {
        
        setShowSuccess(true);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        
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
      console.error("Login error details:", error);
      
      let errorMessage = "Login failed. Please try again.";
      
      // Handle specific Supabase auth errors
      if (error.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email and confirm your account before signing in.";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Too many login attempts. Please wait a moment and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrorMsg(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: errorMessage,
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (formValues: LoginFormValues) => {
    await handleLoginSubmit(formValues.email.trim(), formValues.password);
  };

  const handleVerify2faCode = async (code: string) => {
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
