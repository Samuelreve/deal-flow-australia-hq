
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const ProfileNotAuthenticated: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <p>Please log in to view your profile</p>
      <Button className="mt-4" asChild>
        <Link to="/login">Log In</Link>
      </Button>
    </div>
  );
};

export default ProfileNotAuthenticated;
