
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

type UserIntent = "seller" | "buyer" | "advisor" | "browsing";
type UserProfessional = boolean;

const OnboardingIntentPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [intent, setIntent] = useState<UserIntent | null>(null);
  const [isProfessional, setIsProfessional] = useState<UserProfessional>(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!intent) {
      toast.error("Please select what brings you to DealPilot");
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in to complete onboarding");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      // Update user profile with intent and onboarding completion
      const { error } = await supabase
        .from('profiles')
        .update({
          role: intent,
          is_professional: isProfessional,
          onboarding_complete: true
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update local user state
      if (user.profile) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            role: intent,
            is_professional: isProfessional,
            onboarding_complete: true
          }
        });
      }

      toast.success("Welcome to DealPilot!");
      
      // Redirect based on intent
      if (isProfessional) {
        navigate("/profile");
        toast.info("Please complete your professional profile to be listed in the directory");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`Failed to complete onboarding: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <div className="space-y-3">
              <h3 className="text-lg font-medium">What brings you to DealPilot?</h3>
              <RadioGroup value={intent || ""} onValueChange={(value) => setIntent(value as UserIntent)}>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="seller" id="seller" />
                  <Label htmlFor="seller" className="flex-grow cursor-pointer font-medium">
                    I'm selling a business
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="buyer" id="buyer" />
                  <Label htmlFor="buyer" className="flex-grow cursor-pointer font-medium">
                    I'm buying a business
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="advisor" id="advisor" />
                  <Label htmlFor="advisor" className="flex-grow cursor-pointer font-medium">
                    I'm an advisor or consultant
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="browsing" id="browsing" />
                  <Label htmlFor="browsing" className="flex-grow cursor-pointer font-medium">
                    Just browsing
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center space-x-2 pt-4 border-t">
              <Checkbox 
                id="is-professional" 
                checked={isProfessional}
                onCheckedChange={(checked) => setIsProfessional(checked === true)} 
              />
              <Label htmlFor="is-professional" className="text-sm">
                I am a business broker, lawyer, or professional advisor and would like to be listed in the professionals directory
              </Label>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading || !intent}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                "Continue to DealPilot"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default OnboardingIntentPage;
