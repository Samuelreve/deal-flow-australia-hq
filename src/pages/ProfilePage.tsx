
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/types/auth";
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileLoading from '@/components/profile/ProfileLoading';
import ProfileNotAuthenticated from '@/components/profile/ProfileNotAuthenticated';

const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Just check if user profile is available
    setLoading(false);
  }, [user]);

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    if (user?.profile && updateUserProfile) {
      await updateUserProfile(updatedProfile);
    }
  };

  if (loading) {
    return <ProfileLoading />;
  }

  if (!user || !user.profile) {
    return <ProfileNotAuthenticated />;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <ProfileSidebar profile={user.profile} />
        </div>
        
        <div className="md:w-2/3">
          <ProfileTabs profile={user.profile} onProfileUpdate={handleProfileUpdate} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
