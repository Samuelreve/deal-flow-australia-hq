
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@/types/auth";
import AccountInformationForm from './AccountInformationForm';
import ProfessionalProfileForm from './ProfessionalProfileForm';

interface ProfileTabsProps {
  profile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ profile, onProfileUpdate }) => {
  return (
    <Tabs defaultValue="account">
      <TabsList className="mb-4">
        <TabsTrigger value="account">Account Information</TabsTrigger>
        <TabsTrigger value="professional">Professional Profile</TabsTrigger>
      </TabsList>
      
      <TabsContent value="account">
        <AccountInformationForm profile={profile} onProfileUpdate={onProfileUpdate} />
      </TabsContent>
      
      <TabsContent value="professional">
        <ProfessionalProfileForm profile={profile} onUpdate={onProfileUpdate} />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
