
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AccountInformation: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Account Information</h3>
      <p className="text-sm text-muted-foreground mb-4">
        View your account details
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            value={user?.profile?.email || ''} 
            readOnly
            disabled
          />
          <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
        </div>
      </div>
    </div>
  );
};

export default AccountInformation;
