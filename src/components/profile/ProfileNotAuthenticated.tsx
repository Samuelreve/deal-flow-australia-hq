
import React from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const ProfileNotAuthenticated: React.FC = () => {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Please log in to view your profile</p>
        <Button className="mt-4" asChild>
          <Link to="/login">Log In</Link>
        </Button>
      </div>
    </AppLayout>
  );
};

export default ProfileNotAuthenticated;
