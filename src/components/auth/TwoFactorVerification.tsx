
import { useState } from "react";
import { Loader2, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface TwoFactorVerificationProps {
  challengeId: string;
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
  error?: string;
}

const TwoFactorVerification = ({
  challengeId,
  onVerify,
  onCancel,
  error
}: TwoFactorVerificationProps) => {
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!challengeId || !twoFactorCode || twoFactorCode.length !== 6) {
      return;
    }
    
    setIsVerifying(true);
    
    try {
      await onVerify(twoFactorCode);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center mb-4 space-y-2">
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Two-Factor Authentication</h3>
        <p className="text-sm text-center text-muted-foreground max-w-sm">
          Enter the 6-digit verification code from your authenticator app
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-center py-2">
        <InputOTP
          maxLength={6}
          value={twoFactorCode}
          onChange={setTwoFactorCode}
          disabled={isVerifying}
          render={({ slots }) => (
            <InputOTPGroup>
              {slots.map((slot, index) => (
                <InputOTPSlot key={index} {...slot} index={index} />
              ))}
            </InputOTPGroup>
          )}
        />
      </div>
      
      <div className="space-y-3">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isVerifying || twoFactorCode.length !== 6}
        >
          {isVerifying ? (
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
          onClick={onCancel}
          disabled={isVerifying}
        >
          Back to Login
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          Open your authenticator app to view your verification code
        </p>
      </div>
    </form>
  );
};

export default TwoFactorVerification;
