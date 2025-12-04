
import React from 'react';

const ProfileLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-pulse">Loading profile...</div>
    </div>
  );
};

export default ProfileLoading;
