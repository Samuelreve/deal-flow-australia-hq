
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/types/auth";
import AppLayout from "@/components/layout/AppLayout";
import { fetchUserProfile } from '@/hooks/auth/useUserProfile';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileLoading from '@/components/profile/ProfileLoading';
import ProfileNotAuthenticated from '@/components/profile/ProfileNotAuthenticated';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const userProfile = await fetchUserProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return <ProfileLoading />;
  }

  if (!user || !profile) {
    return <ProfileNotAuthenticated />;
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <ProfileSidebar profile={profile} />
          </div>
          
          <div className="md:w-2/3">
            <ProfileTabs profile={profile} onProfileUpdate={handleProfileUpdate} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
