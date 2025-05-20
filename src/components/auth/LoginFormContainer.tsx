
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import StandardLoginForm from "./StandardLoginForm";
import TwoFactorVerification from "./TwoFactorVerification";
import ResetPasswordForm from "./ResetPasswordForm";
import { useLoginForm } from "@/hooks/useLoginForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginFormContainerProps {
  onSignUp: () => void;
  inviteToken?: string | null;
}

const LoginFormContainer = ({ onSignUp, inviteToken }: LoginFormContainerProps) => {
  const {
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
  } = useLoginForm();

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
        
        {showResetPassword ? (
          <ResetPasswordForm onCancel={handleCancelResetPassword} />
        ) : needs2fa ? (
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
              onForgotPassword={handleForgotPassword}
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

export default LoginFormContainer;
