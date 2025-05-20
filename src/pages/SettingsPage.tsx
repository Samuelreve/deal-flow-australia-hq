
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/types/auth";
import SettingsLayout from "@/components/layout/SettingsLayout";
import SettingsMobileTabs from "@/components/settings/navigation/SettingsMobileTabs";
import SettingsSidebar from "@/components/settings/navigation/SettingsSidebar";
import SettingsContent from "@/components/settings/content/SettingsContent";

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
      <SettingsLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse">Loading settings...</div>
        </div>
      </SettingsLayout>
    );
  }

  if (!user) {
    return (
      <SettingsLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Please log in to access settings</p>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Mobile tabs navigation */}
        <SettingsMobileTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        {/* Desktop sidebar navigation */}
        <SettingsSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        {/* Content area */}
        <SettingsContent 
          activeTab={activeTab} 
          userProfile={userProfile} 
          handleProfileUpdate={handleProfileUpdate} 
        />
      </div>
    </SettingsLayout>
  );
};

export default SettingsPage;
