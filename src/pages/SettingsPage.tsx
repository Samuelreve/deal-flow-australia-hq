
import React, { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@/types/auth";
import { Settings, Bell, User, Link as LinkIcon } from "lucide-react";
import AccountSettings from "@/components/settings/AccountSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import ProfessionalProfileForm from "@/components/profile/ProfessionalProfileForm";
import IntegrationsSettings from "@/components/settings/IntegrationsSettings";

const SettingsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("account");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Handle profile updates from the professional profile form
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse">Loading settings...</div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Please log in to access settings</p>
        </div>
      </AppLayout>
    );
  }

  // Determine which tabs should be visible based on user role
  const isProfessional = user?.profile?.is_professional;

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Settings className="h-6 w-6 mr-2" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Card>
          <CardContent className="p-0">
            <Tabs 
              defaultValue="account" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Settings Navigation (Sidebar) */}
                <div className="md:w-1/4 border-r">
                  <div className="p-4">
                    <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-1">
                      <TabsTrigger 
                        value="account" 
                        className="w-full justify-start text-left px-3 py-2 data-[state=active]:bg-muted"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Account
                      </TabsTrigger>
                      <TabsTrigger 
                        value="notifications" 
                        className="w-full justify-start text-left px-3 py-2 data-[state=active]:bg-muted"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                      </TabsTrigger>
                      {isProfessional && (
                        <TabsTrigger 
                          value="professional" 
                          className="w-full justify-start text-left px-3 py-2 data-[state=active]:bg-muted"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Professional Profile
                        </TabsTrigger>
                      )}
                      <TabsTrigger 
                        value="integrations" 
                        className="w-full justify-start text-left px-3 py-2 data-[state=active]:bg-muted"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Integrations
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                {/* Settings Content Area */}
                <div className="md:w-3/4 p-6">
                  <TabsContent value="account" className="mt-0">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>
                        Manage your account details and preferences
                      </CardDescription>
                    </CardHeader>
                    <AccountSettings />
                  </TabsContent>

                  <TabsContent value="notifications" className="mt-0">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Control when and how you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <NotificationSettings />
                  </TabsContent>

                  {isProfessional && (
                    <TabsContent value="professional" className="mt-0">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle>Professional Profile</CardTitle>
                        <CardDescription>
                          Manage your professional profile settings
                        </CardDescription>
                      </CardHeader>
                      {user.profile && (
                        <ProfessionalProfileForm 
                          profile={user.profile} 
                          onUpdate={handleProfileUpdate} 
                        />
                      )}
                    </TabsContent>
                  )}

                  <TabsContent value="integrations" className="mt-0">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle>Integrations</CardTitle>
                      <CardDescription>
                        Manage connections with external services
                      </CardDescription>
                    </CardHeader>
                    <IntegrationsSettings />
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
