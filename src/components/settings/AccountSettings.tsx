
import React from 'react';
import { Separator } from "@/components/ui/separator";
import AccountInformation from './AccountInformation';
import PasswordChangeForm from './PasswordChangeForm';
import AccountSecuritySection from './AccountSecuritySection';
import DangerZone from './DangerZone';

const AccountSettings: React.FC = () => {
  return (
    <div className="space-y-10">
      {/* Account Information Section */}
      <AccountInformation />

      <Separator />
      
      {/* Password Change Section */}
      <PasswordChangeForm />

      <Separator />
      
      {/* Account Security Section with 2FA */}
      <AccountSecuritySection />

      <Separator />
      
      {/* Account Deactivation Section */}
      <DangerZone />
    </div>
  );
};

export default AccountSettings;
