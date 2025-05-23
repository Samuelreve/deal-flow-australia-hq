
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (formValues: LoginFormValues) => {
    setErrorMsg("");
    setIsLoading(true);
    
    try {
      const success = await login(formValues.email, formValues.password);
      
      if (success) {
        // If login is successful, navigate to dashboard
        navigate(AUTH_ROUTES.DASHBOARD);
      } else {
        setErrorMsg("Login failed. Please check your credentials.");
      }
    } catch (error: any) {
      handleAuthError(error, toast);
      setErrorMsg(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    errorMsg,
    isLoading: isLoading || loading
  };
};
