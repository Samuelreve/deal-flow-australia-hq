
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useSignUpForm } from "@/hooks/auth/useSignUpForm";
import OAuthButtons from "./OAuthButtons";

interface SignUpFormUIProps {
  inviteToken?: string | null;
  redirect?: string | null;
}

const SignUpFormUI = ({ inviteToken, redirect }: SignUpFormUIProps) => {
  const { 
    email, setEmail,
    password, setPassword,
    name, setName,
    isLoading, error, showSuccess,
    handleSubmit
  } = useSignUpForm(inviteToken, redirect);
  
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Trustroom.ai</h1>
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
                  Account created successfully! Redirecting to your dashboard...
                </AlertDescription>
              </Alert>
            )}
            
            <OAuthButtons mode="signup" disabled={isLoading} />
            
            <div className="relative my-4">
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
                disabled={isLoading}
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
