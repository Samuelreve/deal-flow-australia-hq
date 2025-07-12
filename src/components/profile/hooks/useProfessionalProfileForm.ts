
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useProfileHandler } from '@/hooks/auth/useProfileHandler';
import { UserProfile } from '@/types/auth';
import { toast } from 'sonner';
import { parseSpecializations, ProfessionalProfileFormValues } from '../validation/professionalProfileSchema';
import { useNavigate } from 'react-router-dom';

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
  const [savingProfile, setSavingProfile] = useState(false);
  const { updateProfile } = useProfileHandler();
  const navigate = useNavigate();

  const onSubmit = async (values: ProfessionalProfileFormValues) => {
    setSavingProfile(true);
    
    try {
      const specializations = parseSpecializations(values.specializations);
      
      const profileUpdates: Partial<UserProfile> = {
        is_professional: values.is_professional,
        professional_headline: values.professional_headline || null,
        professional_bio: values.professional_bio || null,
        professional_firm_name: values.professional_firm_name || null,
        professional_contact_email: values.professional_contact_email || null,
        professional_phone: values.professional_phone || null,
        professional_website: values.professional_website || null,
        professional_location: values.professional_location || null,
        professional_specializations: specializations.length > 0 ? specializations : null,
      };

      // If this is a professional completing their profile for the first time, mark onboarding as complete
      if (values.is_professional && !profile.onboarding_complete && values.professional_headline) {
        profileUpdates.onboarding_complete = true;
      }

      console.log('Updating professional profile:', profileUpdates);
      
      const success = await updateProfile(profileUpdates);
      
      if (success) {
        const updatedProfile = { ...profile, ...profileUpdates };
        onUpdate(updatedProfile);
        
        if (onSaveSuccess) {
          onSaveSuccess();
        }
        
        // If onboarding was just completed, redirect to dashboard
        if (profileUpdates.onboarding_complete && !profile.onboarding_complete) {
          toast.success('Professional profile completed! Welcome to Trustroom.ai.');
          navigate('/dashboard');
        } else {
          toast.success('Professional profile updated successfully');
        }
      }
    } catch (error) {
      console.error('Error saving professional profile:', error);
      toast.error('Failed to save professional profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return {
    savingProfile,
    onSubmit
  };
};
