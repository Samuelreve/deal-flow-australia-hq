
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AccountSettings from "@/components/settings/AccountSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import ProfessionalProfileForm from "@/components/profile/ProfessionalProfileForm";
import IntegrationsSettings from "@/components/settings/IntegrationsSettings";
import { UserProfile } from "@/types/auth";

interface SettingsContentProps {
  activeTab: string;
  userProfile: UserProfile | null;
  handleProfileUpdate: (updatedProfile: UserProfile) => void;
}

const SettingsContent: React.FC<SettingsContentProps> = ({ 
  activeTab, 
  userProfile,
  handleProfileUpdate
}) => {
  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardContent className="p-0">
        <div className={activeTab === "account" ? "block" : "hidden"}>
          <div className="p-6 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold">Account Settings</h2>
              <p className="text-muted-foreground mt-1">
                Manage your account details and preferences
              </p>
            </div>
            <Separator />
            <AccountSettings />
          </div>
        </div>
        
        <div className={activeTab === "notifications" ? "block" : "hidden"}>
          <div className="p-6 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold">Notification Preferences</h2>
              <p className="text-muted-foreground mt-1">
                Control when and how you receive notifications
              </p>
            </div>
            <Separator />
            <NotificationSettings />
          </div>
        </div>
        
        <div className={activeTab === "professional" ? "block" : "hidden"}>
          <div className="p-6 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold">Professional Profile</h2>
              <p className="text-muted-foreground mt-1">
                Manage your professional profile settings
              </p>
            </div>
            <Separator />
            {userProfile && (
              <ProfessionalProfileForm 
                profile={userProfile} 
                onUpdate={handleProfileUpdate} 
              />
            )}
          </div>
        </div>
        
        <div className={activeTab === "integrations" ? "block" : "hidden"}>
          <div className="p-6 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold">Integrations</h2>
              <p className="text-muted-foreground mt-1">
                Manage connections with external services
              </p>
            </div>
            <Separator />
            <IntegrationsSettings />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsContent;
