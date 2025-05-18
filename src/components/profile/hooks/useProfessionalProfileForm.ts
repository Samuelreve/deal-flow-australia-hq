
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfessionalProfileFormValues, parseSpecializations } from "../validation/professionalProfileSchema";
import { UserProfile } from "@/types/auth";

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
  onSaveSuccess
}: UseProfessionalProfileFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);

  const onSubmit = async (values: ProfessionalProfileFormValues) => {
    if (!user) return;
    
    setSavingProfile(true);

    try {
      // Convert comma-separated specializations to array
      const specializationsArray = parseSpecializations(values.specializations);
      
      const updates = {
        is_professional: values.is_professional,
        professional_headline: values.professional_headline || null,
        professional_bio: values.professional_bio || null,
        professional_firm_name: values.professional_firm_name || null,
        professional_contact_email: values.professional_contact_email || null,
        professional_phone: values.professional_phone || null,
        professional_website: values.professional_website || null,
        professional_location: values.professional_location || null,
        professional_specializations: specializationsArray.length > 0 ? specializationsArray : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your professional profile has been updated successfully.",
      });
      
      // Update the profile in the parent component
      onUpdate({
        ...profile,
        ...updates,
      });
      
      // Call optional success callback
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  return {
    savingProfile,
    onSubmit,
  };
};
