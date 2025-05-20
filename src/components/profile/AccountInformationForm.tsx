
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/types/auth";
import { Loader2, User, Building, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AccountInformationFormProps {
  profile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const AccountInformationForm: React.FC<AccountInformationFormProps> = ({ profile, onProfileUpdate }) => {
  const { updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    company: profile.company || '',
    phone: profile.phone || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updatedProfile = {
        ...profile,
        name: formData.name,
        company: formData.company,
        phone: formData.phone,
      };
      
      const success = await updateUserProfile(updatedProfile);
      
      if (success) {
        toast({
          title: "Profile updated",
          description: "Your account information has been updated successfully",
        });
        onProfileUpdate(updatedProfile);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">Full Name</Label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <Input 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">Email</Label>
              <Input 
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="bg-gray-50"
                title="Email cannot be changed"
              />
              <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company" className="font-medium">Company</Label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <Building className="h-4 w-4" />
                </div>
                <Input 
                  id="company"
                  name="company"
                  value={formData.company || ''}
                  onChange={handleChange}
                  className="pl-9"
                  placeholder="Your company name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-medium">Phone</Label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <Phone className="h-4 w-4" />
                </div>
                <Input 
                  id="phone"
                  name="phone" 
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="pl-9"
                  placeholder="Your phone number"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="min-w-[150px]" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountInformationForm;
