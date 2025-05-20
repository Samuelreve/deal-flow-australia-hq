
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import AccountInformationForm from "@/components/profile/AccountInformationForm";

const AccountInformation: React.FC = () => {
  const { user } = useAuth();

  if (!user?.profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account Information</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal account details
        </p>
      </div>
      
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
