
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useProfileManagement = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const updateProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
    if (!user?.profile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User profile not found",
      });
      return false;
    }

    setIsUpdating(true);
    setUpdateError("");

    // Show loading toast
    toast({
      title: "Updating profile...",
      description: "Please wait while we save your changes.",
    });

    try {
      // Make sure we're including all required fields
      const updatedProfile = {
        ...user.profile,
        ...profileData,
        updated_at: new Date().toISOString(),
      };

      // Update the profile in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: updatedProfile.name,
          company: updatedProfile.company,
          phone: updatedProfile.phone,
          is_professional: updatedProfile.is_professional,
          professional_headline: updatedProfile.professional_headline,
          professional_bio: updatedProfile.professional_bio,
          professional_firm_name: updatedProfile.professional_firm_name,
          professional_contact_email: updatedProfile.professional_contact_email,
          professional_phone: updatedProfile.professional_phone,
          professional_website: updatedProfile.professional_website,
          professional_location: updatedProfile.professional_location,
          professional_specializations: updatedProfile.professional_specializations,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.profile.id)
        .select();

      if (error) {
        throw error;
      }

      // Use the AuthContext's updateUserProfile to update the local state
      const success = await updateUserProfile(updatedProfile);

      if (success) {
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
        return true;
      } else {
        const errorMessage = "Failed to update profile. Please try again.";
        setUpdateError(errorMessage);
        toast({
          variant: "destructive",
          title: "Update failed",
          description: errorMessage,
        });
        return false;
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      const errorMessage = error.message || "An error occurred while updating your profile.";
      setUpdateError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Update failed",
        description: errorMessage,
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateAccountInformation = async (data: {
    name: string;
    company?: string;
    phone?: string;
  }) => {
    return await updateProfile(data);
  };

  const updateProfessionalProfile = async (data: {
    is_professional?: boolean;
    professional_headline?: string;
    professional_bio?: string;
    professional_firm_name?: string;
    professional_contact_email?: string;
    professional_phone?: string;
    professional_website?: string;
    professional_location?: string;
    professional_specializations?: string[];
  }) => {
    return await updateProfile(data);
  };

  const toggleProfessionalStatus = async (isProfessional: boolean) => {
    return await updateProfile({ is_professional: isProfessional });
  };

  return {
    isUpdating,
    updateError,
    updateProfile,
    updateAccountInformation,
    updateProfessionalProfile,
    toggleProfessionalStatus,
    currentProfile: user?.profile || null,
  };
};
