
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function useLoginForm() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const navigate = useNavigate();
  
  // 2FA related state
  const [needs2fa, setNeeds2fa] = useState(false);
  const [enrolledFactorId, setEnrolledFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  
  const handleLoginSubmit = async (email: string, password: string) => {
    setError("");
    setIsLoading(true);
    
    // Reset 2FA states
    setNeeds2fa(false);
    setEnrolledFactorId(null);
    setChallengeId(null);
    
    try {
      // Use supabase client directly to check for MFA first
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        throw signInError;
      }
      
      // Check if 2FA is required
      if (data?.user) {
        // User has 2FA enabled, get factors
        const { data: factorData, error: factorError } = await supabase.auth.mfa.listFactors();
        
        if (factorError) {
          throw factorError;
        }
        
        const totpFactor = factorData.totp?.find(f => 
          f.factor_type === 'totp' && f.status === 'verified'
        );
        
        if (totpFactor) {
          setEnrolledFactorId(totpFactor.id);
          
          // Initiate the 2FA challenge
          const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
            factorId: totpFactor.id,
          });
          
          if (challengeError) {
            throw challengeError;
          }
          
          setChallengeId(challengeData.id);
          setNeeds2fa(true); // Show 2FA input
          setIsLoading(false);
          return; // Stop here until 2FA is verified
        }
      }
      
      // No 2FA or 2FA already handled by supabase
      const success = await login(email, password);
      if (success) {
        console.log("Login successful");
        // The navigation will be handled by the useEffect in Login page
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerify2faCode = async (code: string) => {
    if (!challengeId || !code) {
      setError("Please enter the verification code.");
      return;
    }
    
    setError("");
    
    try {
      // Verify the 2FA code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: enrolledFactorId as string,
        challengeId,
        code,
      });
      
      if (error) {
        console.error('2FA Verification Error:', error.message);
        setError('Invalid verification code. Please try again.');
        return;
      }
      
      // 2FA verification successful, user is now logged in
      // The auth state change will be picked up by the AuthContext
      console.log('2FA verification successful');
      toast.success('Login successful');
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during 2FA verification");
      console.error(err);
    }
  };
  
  const handleCancelTwoFactor = () => {
    setNeeds2fa(false);
    setChallengeId(null);
    setEnrolledFactorId(null);
  };

  const handleForgotPassword = () => {
    setShowResetPassword(true);
    setError(""); // Clear any login errors
  };

  const handleCancelResetPassword = () => {
    setShowResetPassword(false);
  };

  return {
    isLoading,
    error,
    showSuccess,
    showResetPassword,
    needs2fa,
    challengeId,
    handleLoginSubmit,
    handleVerify2faCode,
    handleCancelTwoFactor,
    handleForgotPassword,
    handleCancelResetPassword,
    setError,
  };
}
