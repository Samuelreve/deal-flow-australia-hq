
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { UserProfile } from "@/types/auth";
import { ProfessionalProfileFormValues } from "../validation/professionalProfileSchema";

interface UseProfessionalProfileFormProps {
  profile: UserProfile;
  form: UseFormReturn<ProfessionalProfileFormValues>;
  onUpdate: (profile: UserProfile) => void;
  onSaveSuccess?: () => void;
}

export const useProfessionalProfileForm = ({
  profile,
  form,
  onUpdate,
  onSaveSuccess,
}: UseProfessionalProfileFormProps) => {
  const [savingProfile, setSavingProfile] = useState(false);
  const { updateUserProfile } = useAuth();
  const { toast } = useToast();

  const onSubmit = async (data: ProfessionalProfileFormValues) => {
    setSavingProfile(true);
    
    try {
      // Convert comma-separated specializations to array
      const specializations = data.specializations
        ? data.specializations.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      // Prepare updated profile data
      const updatedProfile: UserProfile = {
        ...profile,
        is_professional: data.is_professional,
        professional_headline: data.professional_headline,
        professional_bio: data.professional_bio,
        professional_firm_name: data.professional_firm_name,
        professional_contact_email: data.professional_contact_email,
        professional_phone: data.professional_phone,
        professional_website: data.professional_website,
        professional_location: data.professional_location,
        professional_specializations: specializations
      };

      // Use the new updateUserProfile function
      const success = await updateUserProfile(updatedProfile);
      
      if (success) {
        toast({
          title: "Profile updated",
          description: "Your professional profile has been updated successfully",
        });
        
        // Pass the updated profile back to the parent
        onUpdate(updatedProfile);
        
        // Call optional success callback
        onSaveSuccess?.();
      }
    } catch (error) {
      console.error("Error saving professional profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update your professional profile. Please try again."
      });
    } finally {
      setSavingProfile(false);
    }
  };

  return {
    savingProfile,
    onSubmit
  };
};
