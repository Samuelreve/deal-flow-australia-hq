
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
}

export const LoginForm = ({ onSignUp }: LoginFormProps) => {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        console.log("Login successful, redirecting to dashboard");
        // The navigate is now handled in the login function directly
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      console.error(err);
    } finally {
      setIsLoading(false);
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
          Sign in to your DealPilot account to continue managing your business deals
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
