
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle } from "lucide-react";
import { UserRole } from "@/types/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProfileHandler } from "@/hooks/auth/useProfileHandler";
import AppErrorBoundary from "@/components/common/AppErrorBoundary";

type UserIntent = "seller" | "buyer" | "advisor" | "browsing";

const OnboardingIntentPage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { updateProfile, loading: profileLoading, error: profileError } = useProfileHandler();
  const [intent, setIntent] = useState<UserIntent | null>(null);
  const [isProfessional, setIsProfessional] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!intent) {
      setError("Please select what brings you to DealPilot");
      return false;
    }

    if (!user?.id || !user.profile) {
      setError("You must be logged in to complete onboarding");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updatedProfile = {
        ...user!.profile!,
        role: intent as UserRole,
        is_professional: isProfessional,
        onboarding_complete: !isProfessional || !['advisor', 'lawyer'].includes(intent!)
      };

      const success = await updateProfile(updatedProfile);

      if (success) {
        toast.success("Welcome to DealPilot!");
        
        // Redirect based on intent and professional status
        if (isProfessional && ['advisor', 'lawyer'].includes(intent!)) {
          navigate("/profile");
          toast.info("Please complete your professional profile to be listed in the directory");
        } else {
          navigate("/dashboard");
        }
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to complete onboarding. Please try again.");
      toast.error(`Failed to complete onboarding: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const intentOptions = [
    {
      value: "seller" as UserIntent,
      label: "I'm selling a business",
      description: "List and manage your business sale"
    },
    {
      value: "buyer" as UserIntent,
      label: "I'm buying a business",
      description: "Find and track potential acquisitions"
    },
    {
      value: "advisor" as UserIntent,
      label: "I'm an advisor or consultant",
      description: "Help clients with business transactions"
    },
    {
      value: "browsing" as UserIntent,
      label: "Just browsing",
      description: "Exploring the platform features"
    }
  ];

  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to DealPilot</CardTitle>
            <CardDescription>
              Let us know what brings you here so we can personalize your experience
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Error Display */}
              {(error || profileError) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error || profileError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <h3 className="text-lg font-medium">What brings you to DealPilot?</h3>
                <RadioGroup value={intent || ""} onValueChange={(value) => setIntent(value as UserIntent)}>
                  {intentOptions.map((option) => (
                    <div key={option.value} className="flex items-start space-x-3 rounded-md border p-4 hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                      <div className="flex-grow cursor-pointer" onClick={() => setIntent(option.value)}>
                        <Label htmlFor={option.value} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="flex items-start space-x-3 pt-4 border-t">
                <Checkbox 
                  id="is-professional" 
                  checked={isProfessional}
                  onCheckedChange={(checked) => setIsProfessional(checked === true)} 
                  className="mt-1"
                />
                <div className="flex-grow">
                  <Label htmlFor="is-professional" className="text-sm font-medium cursor-pointer">
                    I am a business professional
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Business brokers, lawyers, and professional advisors can be listed in our directory
                  </p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || profileLoading || !intent}
              >
                {loading || profileLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up your account...
                  </>
                ) : (
                  "Continue to DealPilot"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppErrorBoundary>
  );
};

export default OnboardingIntentPage;
