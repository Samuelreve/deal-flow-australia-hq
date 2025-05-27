
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Scale, Building2, MapPin, Globe, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProfessionalProfileSetupPage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    professional_headline: '',
    professional_bio: '',
    professional_firm_name: '',
    professional_contact_email: user?.email || '',
    professional_phone: '',
    professional_website: '',
    professional_location: '',
    specializations: [] as string[]
  });

  const [newSpecialization, setNewSpecialization] = useState('');

  const commonSpecializations = [
    'Mergers & Acquisitions',
    'Corporate Law',
    'Securities Law',
    'Tax Law',
    'Employment Law',
    'Real Estate Law',
    'Intellectual Property',
    'Contract Law',
    'Compliance',
    'Due Diligence'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSpecialization = (spec: string) => {
    if (spec && !formData.specializations.includes(spec)) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, spec]
      }));
    }
    setNewSpecialization('');
  };

  const removeSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== spec)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.professional_headline.trim()) {
      toast({
        variant: "destructive",
        title: "Professional headline required",
        description: "Please provide a professional headline describing your expertise."
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (!user?.profile) {
        throw new Error('User profile not found');
      }

      const updatedProfile = {
        ...user.profile,
        professional_headline: formData.professional_headline,
        professional_bio: formData.professional_bio,
        professional_firm_name: formData.professional_firm_name,
        professional_contact_email: formData.professional_contact_email,
        professional_phone: formData.professional_phone,
        professional_website: formData.professional_website,
        professional_location: formData.professional_location,
        professional_specializations: formData.specializations,
        is_professional: true,
        onboarding_complete: true
      };

      const success = await updateUserProfile(updatedProfile);
      
      if (success) {
        toast({
          title: "Professional profile complete!",
          description: "Your professional profile has been set up successfully."
        });
        navigate('/dashboard');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error: any) {
      console.error('Professional setup error:', error);
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: error.message || "Failed to complete professional setup. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <Scale className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Complete Your Professional Profile
          </h1>
          <p className="text-muted-foreground">
            Set up your professional profile to be discovered by potential clients
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>
              This information will be visible to other users in the professional directory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="headline">Professional Headline *</Label>
                <Input
                  id="headline"
                  placeholder="e.g., M&A Attorney specializing in middle-market transactions"
                  value={formData.professional_headline}
                  onChange={(e) => handleInputChange('professional_headline', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell potential clients about your experience, expertise, and approach..."
                  rows={4}
                  value={formData.professional_bio}
                  onChange={(e) => handleInputChange('professional_bio', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firm">Firm/Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firm"
                      placeholder="Law Firm Name"
                      className="pl-10"
                      value={formData.professional_firm_name}
                      onChange={(e) => handleInputChange('professional_firm_name', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="City, State"
                      className="pl-10"
                      value={formData.professional_location}
                      onChange={(e) => handleInputChange('professional_location', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.professional_phone}
                    onChange={(e) => handleInputChange('professional_phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      placeholder="https://yourfirm.com"
                      className="pl-10"
                      value={formData.professional_website}
                      onChange={(e) => handleInputChange('professional_website', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Areas of Specialization</Label>
                
                {/* Common specializations */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Select from common specializations:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonSpecializations.map((spec) => (
                      <Badge
                        key={spec}
                        variant={formData.specializations.includes(spec) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => addSpecialization(spec)}
                      >
                        {spec}
                        {formData.specializations.includes(spec) && (
                          <X 
                            className="ml-1 h-3 w-3" 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSpecialization(spec);
                            }}
                          />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Custom specialization input */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Or add a custom specialization:</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter specialization"
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSpecialization(newSpecialization);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => addSpecialization(newSpecialization)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Selected specializations */}
                {formData.specializations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Selected specializations:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.specializations.map((spec) => (
                        <Badge key={spec} variant="default">
                          {spec}
                          <X 
                            className="ml-1 h-3 w-3 cursor-pointer" 
                            onClick={() => removeSpecialization(spec)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={isSubmitting}
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Complete Setup"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalProfileSetupPage;
