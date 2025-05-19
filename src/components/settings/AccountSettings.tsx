
import React from 'react';
import { Separator } from "@/components/ui/separator";
import AccountInformation from './AccountInformation';
import PasswordChangeForm from './PasswordChangeForm';
import DangerZone from './DangerZone';

const AccountSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Account Information Section */}
      <AccountInformation />

      <Separator />
      
      {/* Password Change Section */}
      <PasswordChangeForm />

      {/* Account Deactivation Section - Just a placeholder for now */}
      <Separator />
      
      <DangerZone />
    </div>
  );
};

export default AccountSettings;
