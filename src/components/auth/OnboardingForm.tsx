
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOnboardingFlow } from "@/hooks/auth/useOnboardingFlow";

type UserIntent = "seller" | "buyer" | "advisor" | "browsing";

const OnboardingForm: React.FC = () => {
  const [intent, setIntent] = useState<UserIntent | null>(null);
  const [isProfessional, setIsProfessional] = useState<boolean>(false);
  const { completeOnboarding, loading, error, setError } = useOnboardingFlow();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!intent) {
      setError("Please select what brings you to DealPilot");
      return;
    }

    await completeOnboarding(intent, isProfessional);
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
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome to DealPilot</CardTitle>
        <CardDescription>
          Let us know what brings you here so we can personalize your experience
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
            disabled={loading || !intent}
          >
            {loading ? (
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
  );
};

export default OnboardingForm;
