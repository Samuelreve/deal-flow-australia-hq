
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserProfile } from "@/types/auth";
import { Loader2, User, Building, Phone, CheckCircle, AtSign } from "lucide-react";
import { useProfileManagement } from "@/hooks/profile/useProfileManagement";

interface AccountInformationFormProps {
  profile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const AccountInformationForm: React.FC<AccountInformationFormProps> = ({ profile, onProfileUpdate }) => {
  const { isUpdating, updateAccountInformation } = useProfileManagement();
  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    company: profile.company || '',
    phone: profile.phone || '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Track changes
  useEffect(() => {
    const hasUnsavedChanges = 
      formData.name !== (profile.name || '') ||
      formData.company !== (profile.company || '') ||
      formData.phone !== (profile.phone || '');
    
    setHasChanges(hasUnsavedChanges);
  }, [formData, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setShowSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updateAccountInformation({
      name: formData.name,
      company: formData.company,
      phone: formData.phone,
    });
    
    if (success) {
      const updatedProfile = {
        ...profile,
        name: formData.name,
        company: formData.company,
        phone: formData.phone,
      };
      onProfileUpdate(updatedProfile);
      setShowSaved(true);
      
      // Hide saved indicator after 3 seconds
      setTimeout(() => setShowSaved(false), 3000);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>
          Update your personal information and how you appear on the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">Full Name *</Label>
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
                  disabled={isUpdating}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">Email</Label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <AtSign className="h-4 w-4" />
                </div>
                <Input 
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50 pl-9"
                  title="Email cannot be changed"
                />
              </div>
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
                  disabled={isUpdating}
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
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            {showSaved && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                Changes saved successfully
              </div>
            )}
            <div className="flex-1" />
            <Button 
              type="submit" 
              className="min-w-[150px]" 
              disabled={isUpdating || !hasChanges}
            >
              {isUpdating ? (
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
