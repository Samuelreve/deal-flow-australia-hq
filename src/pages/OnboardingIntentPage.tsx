
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { UserRole } from "@/types/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProfileHandler } from "@/hooks/auth/useProfileHandler";
import AppErrorBoundary from "@/components/common/AppErrorBoundary";
import { supabase } from "@/integrations/supabase/client";

type UserIntent = "seller" | "buyer" | "advisor" | "browsing";

const OnboardingIntentPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { updateProfile, loading: profileLoading, error: profileError, resetError } = useProfileHandler();
  const [intent, setIntent] = useState<UserIntent | null>(null);
  const [isProfessional, setIsProfessional] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const validateForm = () => {
    if (!intent) {
      setError("Please select what brings you to DealPilot");
      return false;
    }

    if (!user?.id) {
      setError("Authentication error. Please log in again.");
      return false;
    }

    return true;
  };

  const createFallbackProfile = async () => {
    if (!user?.id) return false;
    
    try {
      console.log('Creating fallback profile for user:', user.id);
      
      const fallbackProfile = {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split('@')[0] || 'User',
        role: intent as UserRole,
        is_professional: isProfessional,
        onboarding_complete: !isProfessional || intent !== 'advisor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Update user state directly since database operations are failing
      const updatedUser = {
        ...user,
        profile: fallbackProfile
      };
      
      setUser(updatedUser);
      console.log('Fallback profile created successfully');
      
      return true;
    } catch (error) {
      console.error('Failed to create fallback profile:', error);
      return false;
    }
  };

  const handleRetryProfileCreation = async () => {
    setIsRetrying(true);
    setError(null);
    resetError();
    
    try {
      // Try to create a basic profile directly
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user!.id,
          email: user!.email,
          name: user!.name || user!.email.split('@')[0] || 'User',
          role: 'seller',
          onboarding_complete: false
        })
        .select()
        .single();

      if (error) {
        console.error('Direct profile creation failed:', error);
        // If direct creation fails, use fallback
        const fallbackSuccess = await createFallbackProfile();
        if (fallbackSuccess) {
          toast.success("Profile created locally. You can continue using the app.");
          return;
        }
        throw error;
      }

      if (data) {
        // Update user state with new profile
        const updatedUser = {
          ...user!,
          profile: data
        };
        setUser(updatedUser);
        toast.success("Profile created successfully!");
      }
    } catch (error: any) {
      console.error('Retry profile creation failed:', error);
      setError("Database connection issues detected. Using local profile for now.");
      
      // Create fallback profile
      const fallbackSuccess = await createFallbackProfile();
      if (fallbackSuccess) {
        toast.info("Created local profile. Some features may be limited until database connection is restored.");
      } else {
        setError("Unable to create profile. Please contact support.");
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    resetError();
    
    console.log('Form submission started', {
      intent,
      isProfessional,
      userId: user?.id,
      hasProfile: !!user?.profile
    });
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // If user doesn't have a profile, try to update the existing profile through the hook
      if (user?.profile) {
        // Determine if this user needs to complete professional profile
        const isSelectingProfessionalRole = isProfessional && ['advisor'].includes(intent!);
        
        const updatedProfile = {
          role: intent as UserRole,
          is_professional: isProfessional,
          onboarding_complete: !isSelectingProfessionalRole
        };

        console.log('Attempting to update profile with:', updatedProfile);
        
        const success = await updateProfile(updatedProfile);

        if (success) {
          console.log('Profile update successful');
          toast.success("Welcome to DealPilot!");
          
          // Redirect based on intent and professional status
          if (isSelectingProfessionalRole) {
            console.log('Redirecting to profile for professional setup');
            navigate("/profile");
            toast.info("Please complete your professional profile to finish setup");
          } else {
            console.log('Redirecting to dashboard');
            navigate("/dashboard");
          }
        } else {
          throw new Error(profileError || "Failed to update profile");
        }
      } else {
        // User doesn't have a profile, create fallback and continue
        console.log('No profile found, creating fallback');
        const fallbackSuccess = await createFallbackProfile();
        
        if (fallbackSuccess) {
          toast.success("Welcome to DealPilot!");
          navigate("/dashboard");
        } else {
          throw new Error("Failed to create user profile");
        }
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error.message || "Failed to complete onboarding. Please try again.";
      setError(errorMessage);
      toast.error(`Failed to complete onboarding: ${errorMessage}`);
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

  // Show profile creation options if user has no profile
  if (!user?.profile) {
    return (
      <AppErrorBoundary>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Profile Setup Required</CardTitle>
              <CardDescription>
                We need to create your profile to continue
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  There seems to be an issue with the database connection. We can create a local profile for you to continue using the app.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button 
                  onClick={handleRetryProfileCreation}
                  disabled={isRetrying}
                  className="w-full"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Create Profile & Continue
                    </>
                  )}
                </Button>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppErrorBoundary>
    );
  }

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
