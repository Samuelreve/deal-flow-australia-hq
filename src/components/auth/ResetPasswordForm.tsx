
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ResetPasswordFormProps {
  onCancel: () => void;
}

const ResetPasswordForm = ({ onCancel }: ResetPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Set redirect URL to reset password page 
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setSuccess(true);
      toast.success("Password reset link sent to your email");
      
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "Failed to send reset password link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button 
          type="button" 
          variant="ghost" 
          className="p-0 h-auto mr-2" 
          onClick={onCancel}
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">Reset your password</h3>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success ? (
        <div className="space-y-4">
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertDescription>
              If an account exists with this email, we've sent a password reset link.
              Please check your inbox and spam folder.
            </AlertDescription>
          </Alert>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="w-full"
          >
            Return to login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending link...
                </>
              ) : "Send Reset Link"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            We'll email you a link to reset your password
          </p>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordForm;
