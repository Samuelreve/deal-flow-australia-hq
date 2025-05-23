import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // Use the main AuthContext
import { AUTH_ROUTES } from "@/contexts/auth/constants";
import { handleAuthError } from "@/contexts/auth/authUtils";
import { useToast } from "@/hooks/use-toast";

interface LoginFormValues {
  email: string;
  password: string;
}

export const useLoginForm = () => {
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
        // If login is successful, navigate to dashboard
        navigate(AUTH_ROUTES.DASHBOARD);
        return true;
      } else {
        setErrorMsg("Login failed. Please check your credentials.");
        return false;
      }
    } catch (error: any) {
      handleAuthError(error, toast);
      setErrorMsg(error.message || "Login failed");
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
  };

  const handleCancelResetPassword = () => {
    setShowResetPassword(false);
  };

  return {
    form,
    onSubmit,
    errorMsg,
    isLoading: isLoading || loading,
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
