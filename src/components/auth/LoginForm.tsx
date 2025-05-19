
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import StandardLoginForm from "./StandardLoginForm";
import TwoFactorVerification from "./TwoFactorVerification";

interface LoginFormProps {
  onSignUp: () => void;
  inviteToken?: string | null;
}

export const LoginForm = ({ onSignUp, inviteToken }: LoginFormProps) => {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  
  // Add 2FA related state
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

  const handleResetPassword = async () => {
    // This will be implemented in an upcoming feature
    toast.info("Password reset functionality coming soon");
  };

  return (
    <Card className="border-accent-foreground/20 shadow-lg">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          {inviteToken 
            ? "Sign in to your DealPilot account to accept the invitation" 
            : "Sign in to your DealPilot account to continue managing your business deals"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showSuccess && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>
              Account created successfully! Please check your email to verify your account before logging in.
            </AlertDescription>
          </Alert>
        )}
        
        {needs2fa ? (
          <TwoFactorVerification 
            challengeId={challengeId || ""}
            onVerify={handleVerify2faCode}
            onCancel={handleCancelTwoFactor}
            error={error}
          />
        ) : (
          <>
            <StandardLoginForm 
              onSubmit={handleLoginSubmit}
              error={error}
              isLoading={isLoading}
            />
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={onSignUp}
              disabled={isLoading}
            >
              Create an account
            </Button>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground p-6 pt-0">
        <p>
          For testing purposes, you can create a new account with your email and password.
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
