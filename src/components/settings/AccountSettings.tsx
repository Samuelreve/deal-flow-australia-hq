
import React from 'react';
import { Separator } from "@/components/ui/separator";
import AccountInformation from './AccountInformation';
import PasswordChangeForm from './PasswordChangeForm';
import AccountSecuritySection from './AccountSecuritySection';
import DangerZone from './DangerZone';

const AccountSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Account Information Section */}
      <AccountInformation />

      <Separator />
      
      {/* Password Change Section */}
      <PasswordChangeForm />

      <Separator />
      
      {/* Account Security Section with 2FA */}
      <AccountSecuritySection />

      {/* Account Deactivation Section */}
      <Separator />
      
      <DangerZone />
    </div>
  );
};

export default AccountSettings;
