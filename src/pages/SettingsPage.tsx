
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@/types/auth";
import { Settings, Bell, User, Link as LinkIcon } from "lucide-react";
import AccountSettings from "@/components/settings/AccountSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import ProfessionalProfileForm from "@/components/profile/ProfessionalProfileForm";
import IntegrationsSettings from "@/components/settings/IntegrationsSettings";
import { Separator } from "@/components/ui/separator";

const SettingsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("account");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user && user.profile) {
      setUserProfile(user.profile);
    }
  }, [user]);

  // Handle profile updates from forms
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
  const isProfessional = userProfile?.is_professional;

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <Settings className="h-6 w-6 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        
        <Separator className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Desktop sidebar navigation */}
          <div className="hidden lg:block">
            <div className="space-y-1 sticky top-8">
              <button 
                onClick={() => setActiveTab("account")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                  activeTab === "account" 
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Account</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("notifications")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                  activeTab === "notifications" 
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
              >
                <Bell className="h-5 w-5" />
                <span className="font-medium">Notifications</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("professional")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                  activeTab === "professional" 
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Professional Profile</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("integrations")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                  activeTab === "integrations" 
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
              >
                <LinkIcon className="h-5 w-5" />
                <span className="font-medium">Integrations</span>
              </button>
            </div>
          </div>
          
          {/* Mobile tabs navigation */}
          <div className="lg:hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="account">
                  <span className="flex flex-col items-center">
                    <User className="h-4 w-4 mb-1" />
                    <span className="text-xs">Account</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <span className="flex flex-col items-center">
                    <Bell className="h-4 w-4 mb-1" />
                    <span className="text-xs">Notifications</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="professional">
                  <span className="flex flex-col items-center">
                    <User className="h-4 w-4 mb-1" />
                    <span className="text-xs">Professional</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="integrations">
                  <span className="flex flex-col items-center">
                    <LinkIcon className="h-4 w-4 mb-1" />
                    <span className="text-xs">Integrations</span>
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Content area */}
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
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
