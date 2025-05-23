
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AccountInformationForm from "@/components/profile/AccountInformationForm";
import AccountHeader from './account/AccountHeader';

const AccountInformation: React.FC = () => {
  const { user } = useAuth();

  if (!user?.profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <AccountHeader />
      <AccountInformationForm 
        profile={user.profile} 
        onProfileUpdate={(updatedProfile) => {
          // Profile update is handled by the form
        }} 
      />
    </div>
  );
};

export default AccountInformation;
