
import React from 'react';
import { Separator } from "@/components/ui/separator";
import AccountInformation from './AccountInformation';
import PasswordChangeForm from './PasswordChangeForm';
import AccountSecuritySection from './AccountSecuritySection';
import DangerZone from './DangerZone';

const AccountSettings: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Account Information Section */}
      <div>
        <AccountInformation />
      </div>

      <Separator className="my-6" />
      
      {/* Password Change Section */}
      <div>
        <PasswordChangeForm />
      </div>

      <Separator className="my-6" />
      
      {/* Account Security Section with 2FA */}
      <div>
        <AccountSecuritySection />
      </div>

      <Separator className="my-6" />
      
      {/* Account Deactivation Section */}
      <div>
        <DangerZone />
      </div>
    </div>
  );
};

export default AccountSettings;
