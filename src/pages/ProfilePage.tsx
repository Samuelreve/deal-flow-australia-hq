
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, UserProfile } from "@/types/auth";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProfessionalProfileForm from "@/components/profile/ProfessionalProfileForm";
import { Separator } from "@/components/ui/separator";
import { fetchUserProfile } from '@/hooks/auth/useUserProfile';

const ProfilePage = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
  });
  
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);
  
  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const userProfile = await fetchUserProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          name: userProfile.name || '',
          email: userProfile.email || '',
          company: userProfile.company || '',
          phone: userProfile.phone || '',
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error loading profile",
        description: "There was a problem loading your profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          company: formData.company,
          phone: formData.phone,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      // Refresh profile
      loadUserProfile();
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };
  
  const getNameInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse">Loading profile...</div>
        </div>
      </AppLayout>
    );
  }

  if (!user || !profile) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <p>Please log in to view your profile</p>
          <Button className="mt-4" href="/login">Log In</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
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
          </div>
          
          <div className="md:w-2/3">
            <Tabs defaultValue="account">
              <TabsList className="mb-4">
                <TabsTrigger value="account">Account Information</TabsTrigger>
                <TabsTrigger value="professional">Professional Profile</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Update your account details and preferences.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email"
                            name="email"
                            value={formData.email}
                            disabled
                            title="Email cannot be changed"
                          />
                          <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input 
                            id="company"
                            name="company"
                            value={formData.company || ''}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input 
                            id="phone"
                            name="phone" 
                            value={formData.phone || ''}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      
                      <Button type="submit" className="w-full">Save Changes</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="professional">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Profile</CardTitle>
                    <CardDescription>
                      Manage your professional details that will be visible in the professionals directory.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profile && <ProfessionalProfileForm profile={profile} onUpdate={handleProfileUpdate} />}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
