
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AccountInformation from '@/components/settings/AccountInformation';

const SettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        
        <div className="grid gap-6">
          <AccountInformation />
          
          <Card>
            <CardHeader>
              <CardTitle>Other Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Additional settings will be available here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
