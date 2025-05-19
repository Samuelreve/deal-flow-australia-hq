
import React from 'react';
import AppLayout from "@/components/layout/AppLayout";

const ProfileLoading: React.FC = () => {
  return (
    <AppLayout>
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    </AppLayout>
  );
};

export default ProfileLoading;
