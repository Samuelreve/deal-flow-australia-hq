
import React from 'react';
import { Shield } from "lucide-react";
import TwoFactorAuthentication from './security/TwoFactorAuthentication';

const AccountSecuritySection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Account Security</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Add an extra layer of security to your account by enabling two-factor authentication (2FA)
      </p>

      <TwoFactorAuthentication />
    </div>
  );
};

export default AccountSecuritySection;
