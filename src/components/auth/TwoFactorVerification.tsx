
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    
    if (!challengeId || !twoFactorCode) {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-4">
        <p>Please enter the verification code from your authenticator app.</p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Input
          id="twoFactorCode"
          type="text"
          placeholder="000000"
          value={twoFactorCode}
          onChange={(e) => setTwoFactorCode(e.target.value)}
          className="text-center text-lg"
          required
          maxLength={6}
          disabled={isVerifying}
        />
      </div>
      
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
    </form>
  );
};

export default TwoFactorVerification;
