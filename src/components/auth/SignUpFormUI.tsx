
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, Link } from "react-router-dom";
import { useSignUpForm } from "@/hooks/auth/useSignUpForm";
import OAuthButtons from "./OAuthButtons";
import { CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from "@/lib/legal-versions";

interface SignUpFormUIProps {
  inviteToken?: string | null;
  redirect?: string | null;
}

const SignUpFormUI = ({ inviteToken, redirect }: SignUpFormUIProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  
  const { 
    email, setEmail,
    password, setPassword,
    name, setName,
    isLoading, error, showSuccess,
    handleSubmit
  } = useSignUpForm(inviteToken, redirect, termsAccepted, privacyAccepted);
  
  const navigate = useNavigate();
  
  const allTermsAccepted = termsAccepted && privacyAccepted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex flex-col items-center justify-center p-4 md:p-8 relative">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient">Trustroom.ai</h1>
          <p className="text-muted-foreground mt-2">
            Create your account to get started
          </p>
        </div>
        
        <Card className="border-accent-foreground/20 shadow-lg">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Join Trustroom.ai to manage your business deals efficiently
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {showSuccess && (
              <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  Account created successfully! Redirecting to your dashboard...
                </AlertDescription>
              </Alert>
            )}
            
            {/* Terms & Privacy Checkboxes - Must accept before any signup */}
            <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium text-foreground">Before creating your account:</p>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the{" "}
                  <Link 
                    to="/terms-of-service" 
                    target="_blank"
                    className="text-primary hover:underline font-medium"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  <span className="text-xs text-muted-foreground/70">(v{CURRENT_TERMS_VERSION})</span>
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={privacyAccepted}
                  onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <label htmlFor="privacy" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the{" "}
                  <Link 
                    to="/privacy-policy" 
                    target="_blank"
                    className="text-primary hover:underline font-medium"
                  >
                    Privacy Policy
                  </Link>{" "}
                  <span className="text-xs text-muted-foreground/70">(v{CURRENT_PRIVACY_VERSION})</span>
                  {" "}and understand that AI features are provided as described in the{" "}
                  <Link 
                    to="/ai-disclaimer" 
                    target="_blank"
                    className="text-primary hover:underline font-medium"
                  >
                    AI Disclaimer
                  </Link>
                </label>
              </div>
              
              {!allTermsAccepted && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs mt-2">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Please accept both agreements to continue</span>
                </div>
              )}
            </div>
            
            <OAuthButtons 
              mode="signup" 
              disabled={isLoading || !allTermsAccepted}
              termsAccepted={termsAccepted}
              privacyAccepted={privacyAccepted}
            />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-input/50"
                  disabled={isLoading}
                />
              </div>
              
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-input/50"
                  minLength={6}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !allTermsAccepted}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : "Sign Up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground p-6 pt-0">
            <p>
              Already have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto text-primary" 
                onClick={() => navigate("/login")}
                disabled={isLoading}
              >
                Log in
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignUpFormUI;
