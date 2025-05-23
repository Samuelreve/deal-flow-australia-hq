
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AccountInformationForm from "@/components/profile/AccountInformationForm";
import AccountHeader from './account/AccountHeader';

const AccountInformation: React.FC = () => {
  const { user, updateUserProfile } = useAuth();

  if (!user?.profile) {
    return null;
  }

  const handleProfileUpdate = async (updatedProfile: any) => {
    if (updateUserProfile) {
      await updateUserProfile(updatedProfile);
    }
  };

  return (
    <div className="space-y-6">
      <AccountHeader />
      <AccountInformationForm 
        profile={user.profile} 
        onProfileUpdate={handleProfileUpdate} 
      />
    </div>
  );
};

export default AccountInformation;
