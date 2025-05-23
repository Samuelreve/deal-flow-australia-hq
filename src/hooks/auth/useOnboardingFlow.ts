
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserRole } from '@/types/auth';

type UserIntent = "seller" | "buyer" | "advisor" | "browsing";

export const useOnboardingFlow = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeOnboarding = async (intent: UserIntent, isProfessional: boolean) => {
    if (!user?.profile) {
      setError("User profile not found. Please try logging in again.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const isSelectingProfessionalRole = isProfessional && intent === 'advisor';
      
      const updatedProfile = {
        ...user.profile,
        role: intent as UserRole,
        is_professional: isProfessional,
        onboarding_complete: !isSelectingProfessionalRole
      };

      console.log('Updating profile with:', updatedProfile);
      const success = await updateUserProfile(updatedProfile);

      if (success) {
        toast.success("Welcome to DealPilot!");
        
        if (isSelectingProfessionalRole) {
          navigate("/profile");
          toast.info("Please complete your professional profile to finish setup");
        } else {
          navigate("/dashboard");
        }
        return true;
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error: any) {
      console.error("Onboarding error:", error);
      setError(error.message || "Failed to complete onboarding. Please try again.");
      toast.error("Failed to complete onboarding. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    completeOnboarding,
    loading,
    error,
    setError
  };
};
