
import React from 'react';
import { UserProfile } from "@/types/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProfileSidebarProps {
  profile: UserProfile;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ profile }) => {
  const getNameInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>View and manage your account details.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Avatar className="h-24 w-24">
          {profile.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.name} />
          ) : (
            <AvatarFallback className="text-2xl">{getNameInitials(profile.name)}</AvatarFallback>
          )}
        </Avatar>
        <h2 className="mt-4 text-xl font-bold">{profile.name}</h2>
        <p className="text-muted-foreground">{profile.email}</p>
        <p className="text-sm mt-2">
          Role: <span className="font-semibold capitalize">{profile.role}</span>
        </p>
        <Separator className="my-4" />
        <div className="w-full text-sm">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <span className="text-muted-foreground">Company:</span>
            <span className="font-medium">{profile.company || 'Not provided'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Phone:</span>
            <span className="font-medium">{profile.phone || 'Not provided'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
