import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { invitationService } from "@/services/invitationService";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import { CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from "@/lib/legal-versions";

export const useSignUpForm = (
  inviteToken?: string | null, 
  redirect?: string | null,
  termsAccepted?: boolean,
  privacyAccepted?: boolean
) => {
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
    if (!termsAccepted || !privacyAccepted) {
      setError("You must accept the Terms & Conditions and Privacy Policy to create an account");
      return false;
    }
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

  const recordLegalAcceptance = async (userId: string, userEmail: string) => {
    try {
      // Try to get IP address (may fail due to CORS, that's okay)
      let ipAddress = '0.0.0.0';
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ipAddress = data.ip || '0.0.0.0';
      } catch {
        // IP fetch failed, use default
      }

      const { error: insertError } = await supabase
        .from('legal_acceptances')
        .insert({
          user_id: userId,
          email: userEmail,
          terms_version: CURRENT_TERMS_VERSION,
          privacy_version: CURRENT_PRIVACY_VERSION,
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
          accepted_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Error recording legal acceptance:", insertError);
      }

      // Also update profile with acceptance flags
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          terms_version: CURRENT_TERMS_VERSION,
          privacy_accepted: true,
          privacy_accepted_at: new Date().toISOString(),
          privacy_version: CURRENT_PRIVACY_VERSION
        })
        .eq('id', userId);

      if (profileError) {
        console.error("Error updating profile with acceptance:", profileError);
      }
    } catch (err) {
      console.error("Error in recordLegalAcceptance:", err);
    }
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
        // Record legal acceptance immediately after account creation
        await recordLegalAcceptance(signupData.user.id, email);
        
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
