import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { invitationService } from "@/services/invitationService";
import { authService } from "@/services/authService";

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
      // Use authService directly to get user ID from signup response
      const signupData = await authService.signup(email, password, name);
      
      if (signupData.user) {
        setShowSuccess(true);
        
        // If there's an invitation token, accept it automatically using the user ID from signup
        if (inviteToken && signupData.user.id) {
          try {
            const result = await invitationService.acceptInvitation(inviteToken, signupData.user.id);
            if (result.success && result.data) {
              toast({
                title: "Account created and invitation accepted!",
                description: "Welcome to the deal. Redirecting you now...",
              });
              
              // Redirect to deal page after a short delay
              setTimeout(() => {
                navigate(`/deals/${result.data.dealId}`, { replace: true });
              }, 1500);
              return;
            }
          } catch (inviteError) {
            console.error("Error accepting invitation:", inviteError);
            // Still show success for account creation but redirect to dashboard
            toast({
              title: "Account created successfully!",
              description: "Welcome to Trustroom.ai. There was an issue with the invitation, redirecting to dashboard...",
            });
            setTimeout(() => {
              navigate("/dashboard", { replace: true });
            }, 1500);
            return;
          }
        }
        
        // Update auth context with the new user data
        await signup(email, password, name);
        
        toast({
          title: "Account created successfully!",
          description: "Welcome to Trustroom.ai. You can now start managing your deals.",
        });
        
        // Small delay to show success state, then redirect
        setTimeout(() => {
          if (redirect) {
            navigate(redirect, { replace: true });
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