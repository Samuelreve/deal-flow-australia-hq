import { useState, useEffect } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, Loader2, CheckCircle2, Building, Users, FileCheck, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const Login = () => {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  
  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        console.log("Login successful, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignUp = async () => {
    navigate("/signup");
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
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If already authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting to dashboard...</span>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col lg:flex-row">
      {/* Left column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">DealPilot</h1>
            <p className="text-muted-foreground mt-2">
              Streamline your business exchange journey
            </p>
          </div>
          
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
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
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
                  onClick={handleSignUp}
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
        </div>
      </div>
      
      {/* Right column - Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted p-8 items-center justify-center">
        <div className="max-w-lg space-y-8">
          <div>
            <h2 className="text-3xl font-bold">Streamlined Business Exchange Platform</h2>
            <p className="text-muted-foreground mt-2">
              DealPilot helps facilitate business sales from initial offer to final closing, with structured workflows and comprehensive tools.
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <Building className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-medium">Complete Deal Management</h3>
                <p className="text-sm text-muted-foreground">
                  Track progress, manage documents, and coordinate all aspects of your business sale in one place.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Users className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-medium">Role-Based Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Work efficiently with buyers, sellers, lawyers, and other stakeholders with tailored interfaces for each role.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <FileCheck className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-medium">Structured Deal Process</h3>
                <p className="text-sm text-muted-foreground">
                  Follow clear milestones, maintain compliance, and ensure nothing falls through the cracks.
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-6">
            <Button variant="link" className="text-primary group" asChild>
              <Link to="/">
                Learn more about DealPilot
                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
