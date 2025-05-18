
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/auth';
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Define the type for the form data
interface IntentFormData {
  primaryIntent: UserRole | '';
}

const IntentCapturePage: React.FC = () => {
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State to manage form input values
  const [formData, setFormData] = useState<IntentFormData>({
    primaryIntent: '',
  });

  // State for submission process
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // --- Handle Form Input Changes ---
  const handleIntentChange = (value: string) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      primaryIntent: value as UserRole,
    }));
  };

  // --- Handle Form Submission ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Basic validation
    if (!formData.primaryIntent) {
      setSubmitError('Please select your primary intent.');
      toast.error('Please select your primary intent.');
      return;
    }

    if (!user || !session?.access_token) {
      setSubmitError('Authentication error. Please log in again.');
      toast.error('Authentication error.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare the data to update the user's profile
      const profileUpdateData = {
        onboarding_complete: true,
        role: formData.primaryIntent,
      };

      // Update the user's profile
      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating profile during onboarding:', error);
        throw new Error(error.message || 'Failed to save onboarding information.');
      }

      // Profile updated successfully
      console.log('Onboarding complete. Profile updated:', data);
      toast.success('Welcome to DealPilot!');

      // Update the local user state
      if (user.profile) {
        // This will update the application state with the new profile data
        // This requires that your useAuth hook has a setUser function
        // You may need to adjust this based on your actual implementation
        const updatedUser = {
          ...user,
          profile: {
            ...user.profile,
            onboarding_complete: true,
            role: formData.primaryIntent
          }
        };
        // This assumes your AuthContext has a setUser method
        // If not, you'll need to adjust this or implement it
        // setUser(updatedUser);
      }

      // Redirect to the Dashboard
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Onboarding submission error:', error);
      setSubmitError(`Failed to complete onboarding: ${error.message}`);
      toast.error(`Failed to complete onboarding: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Conditional Rendering based on Auth State and Onboarding Status ---
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    navigate('/login');
    return null;
  }

  if (user.profile?.onboarding_complete) {
    console.log('User already onboarded, redirecting to dashboard.');
    navigate('/dashboard');
    return null;
  }

  // Render the onboarding form using shadcn/ui components
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to DealPilot</CardTitle>
          <CardDescription>
            Tell us how you plan to use DealPilot so we can tailor your experience
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">What brings you to DealPilot today?</h3>
              <RadioGroup value={formData.primaryIntent} onValueChange={handleIntentChange}>
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
                  <RadioGroupItem value="lawyer" id="lawyer" />
                  <Label htmlFor="lawyer" className="flex-grow cursor-pointer font-medium">
                    I'm a lawyer
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

            {/* Show error message if any */}
            {submitError && (
              <p className="text-destructive text-sm">{submitError}</p>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !formData.primaryIntent}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
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

export default IntentCapturePage;
