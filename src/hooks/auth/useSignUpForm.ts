
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useSignUpForm = (inviteToken?: string | null, redirect?: string | null) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: error,
      });
      return;
    }

    setError("");
    setIsLoading(true);

    // Show loading toast
    toast({
      title: "Creating account...",
      description: "Please wait while we set up your account.",
    });

    try {
      const success = await signup(email, password, name);
      
      if (success) {
        setShowSuccess(true);
        toast({
          title: "Account created successfully!",
          description: "Welcome to Trustroom.ai. You can now start managing your deals.",
        });
        
        // Small delay to show success state, then redirect
        setTimeout(() => {
          if (redirect) {
            navigate(redirect, { replace: true });
          } else if (inviteToken) {
            navigate(`/accept-invite?token=${inviteToken}`, { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        }, 1500);
      } else {
        const errorMessage = "Failed to create account. Please try again.";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: errorMessage,
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage = error.message || "An error occurred during signup. Please try again.";
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    isLoading,
    error,
    showSuccess,
    handleSubmit
  };
};
