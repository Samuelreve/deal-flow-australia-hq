
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import StandardLoginForm from "../StandardLoginForm";
import OAuthButtons from "../OAuthButtons";

interface StandardLoginViewProps {
  onSignUp: () => void;
  handleLoginSubmit: (email: string, password: string) => Promise<boolean>;
  handleForgotPassword: () => void;
  error?: string;
  isLoading: boolean;
  showSuccess: boolean;
}

const StandardLoginView = ({
  onSignUp,
  handleLoginSubmit,
  handleForgotPassword,
  error,
  isLoading,
  showSuccess
}: StandardLoginViewProps) => {
  const handleSubmit = async (email: string, password: string) => {
    await handleLoginSubmit(email, password);
  };

  return (
    <>
      {showSuccess && (
        <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Account created successfully! Please check your email to verify your account before logging in.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <OAuthButtons mode="signin" disabled={isLoading} />
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>
      
      <StandardLoginForm 
        onSubmit={handleSubmit}
        onForgotPassword={handleForgotPassword}
        error={error}
        isLoading={isLoading}
      />
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">New to Trustroom?</span>
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
  );
};

export default StandardLoginView;
