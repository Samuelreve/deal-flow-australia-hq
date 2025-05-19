
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import TwoFactorAuthentication from './security/TwoFactorAuthentication';

const AccountSecuritySection: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Two-Factor Authentication (2FA)</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Add an extra layer of security to your account by enabling two-factor authentication
      </p>

      <Card>
        <CardContent className="pt-6">
          <TwoFactorAuthentication />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSecuritySection;
