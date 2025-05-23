
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AccountInformationForm from "@/components/profile/AccountInformationForm";
import AccountHeader from './account/AccountHeader';
import { UserProfile } from '@/types/auth';

const AccountInformation: React.FC = () => {
  const { user } = useAuth();

  if (!user?.profile) {
    return null;
  }

  // Ensure the profile has all required UserProfile properties
  const fullProfile: UserProfile = {
    id: user.profile.id || user.id,
    email: user.profile.email || user.email,
    name: user.profile.name || '',
    role: user.profile.role || 'buyer',
    avatar_url: user.profile.avatar_url,
    company: user.profile.company,
    phone: user.profile.phone,
    is_professional: user.profile.is_professional,
    professional_headline: user.profile.professional_headline,
    professional_bio: user.profile.professional_bio,
    professional_firm_name: user.profile.professional_firm_name,
    professional_contact_email: user.profile.professional_contact_email,
    professional_phone: user.profile.professional_phone,
    professional_website: user.profile.professional_website,
    professional_location: user.profile.professional_location,
    professional_specializations: user.profile.professional_specializations,
    onboarding_complete: user.profile.onboarding_complete,
    created_at: user.profile.created_at,
    updated_at: user.profile.updated_at
  };

  return (
    <div className="space-y-6">
      <AccountHeader />
      <AccountInformationForm 
        profile={fullProfile} 
        onProfileUpdate={(updatedProfile) => {
          // Profile update is handled by the form
        }} 
      />
    </div>
  );
};

export default AccountInformation;
