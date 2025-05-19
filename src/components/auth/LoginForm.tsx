
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface LoginFormProps {
  onSignUp: () => void;
  inviteToken?: string | null;
}

export const LoginForm = ({ onSignUp, inviteToken }: LoginFormProps) => {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  
  // Add 2FA related state
  const [needs2fa, setNeeds2fa] = useState(false);
  const [enrolledFactorId, setEnrolledFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isVerifying2faLogin, setIsVerifying2faLogin] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && inviteToken) {
      // Redirect to accept invitation page if logged in with invite token
      navigate(`/accept-invite?token=${inviteToken}`, { replace: true });
    } else if (isAuthenticated) {
      // Standard redirect to dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate, inviteToken]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // Reset 2FA states
    setNeeds2fa(false);
    setEnrolledFactorId(null);
    setChallengeId(null);
    setTwoFactorCode('');
    setIsVerifying2faLogin(false);
    
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
      if (data?.user?.mfa_enabled) {
        // User has 2FA enabled, get factors
        const { data: factorData, error: factorError } = await supabase.auth.mfa.listFactors();
        
        if (factorError) {
          throw factorError;
        }
        
        const totpFactor = factorData.factors?.find(f => 
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
        // The navigation will be handled by the useEffect above
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerify2faCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!challengeId || !twoFactorCode) {
      setError("Please enter the verification code.");
      return;
    }
    
    setIsVerifying2faLogin(true);
    setError("");
    
    try {
      // Verify the 2FA code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: enrolledFactorId as string,
        challengeId,
        code: twoFactorCode,
      });
      
      if (error) {
        console.error('2FA Verification Error:', error.message);
        setError('Invalid verification code. Please try again.');
        setIsVerifying2faLogin(false);
        return;
      }
      
      // 2FA verification successful, user is now logged in
      // The auth state change will be picked up by the AuthContext
      console.log('2FA verification successful');
      toast.success('Login successful');
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during 2FA verification");
      console.error(err);
    } finally {
      setIsVerifying2faLogin(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address to reset your password");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Password reset instructions sent to your email");
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email");
    } finally {
      setIsLoading(false);
    }
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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {showSuccess && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>
              Account created successfully! Please check your email to verify your account before logging in.
            </AlertDescription>
          </Alert>
        )}
        
        {needs2fa ? (
          // 2FA Verification form
          <form onSubmit={handleVerify2faCode} className="space-y-4">
            <div className="text-center mb-4">
              <p>Please enter the verification code from your authenticator app.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="twoFactorCode">Verification Code</Label>
              <Input
                id="twoFactorCode"
                type="text"
                placeholder="000000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="text-center text-lg"
                required
                maxLength={6}
                disabled={isVerifying2faLogin}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isVerifying2faLogin || twoFactorCode.length !== 6}
            >
              {isVerifying2faLogin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : "Verify"}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                setNeeds2fa(false);
                setTwoFactorCode('');
                setChallengeId(null);
                setEnrolledFactorId(null);
              }}
              disabled={isVerifying2faLogin}
            >
              Back to Login
            </Button>
          </form>
        ) : (
          // Regular login form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-input/50"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="px-0 h-auto text-primary" 
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isLoading}
                >
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-input/50"
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : "Sign in"}
            </Button>
            
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
          </form>
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
