
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoginForm } from "@/hooks/useLoginForm";
import StandardLoginView from "./views/StandardLoginView";
import TwoFactorView from "./views/TwoFactorView";
import ResetPasswordView from "./views/ResetPasswordView";
import LoginFormFooter from "./views/LoginFormFooter";

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
        {showResetPassword ? (
          <ResetPasswordView onCancel={handleCancelResetPassword} />
        ) : needs2fa ? (
          <TwoFactorView 
            challengeId={challengeId || ""}
            onVerify={handleVerify2faCode}
            onCancel={handleCancelTwoFactor}
            error={error}
          />
        ) : (
          <StandardLoginView 
            onSignUp={onSignUp}
            handleLoginSubmit={handleLoginSubmit}
            handleForgotPassword={handleForgotPassword}
            error={error}
            isLoading={isLoading}
            showSuccess={showSuccess}
          />
        )}
      </CardContent>
      <LoginFormFooter />
    </Card>
  );
};

export default LoginFormContainer;
