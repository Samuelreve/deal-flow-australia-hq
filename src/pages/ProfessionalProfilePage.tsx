
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from "@/types/auth";
import { Loader2, MapPin, Briefcase, Globe, ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import AppLayout from '@/components/layout/AppLayout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface PublicProfessionalProfile extends UserProfile {
  professional_website?: string;
}

const ProfessionalProfilePage: React.FC = () => {
  const { professionalId } = useParams<{ professionalId: string }>();
  const { toast } = useToast();

  const [profile, setProfile] = useState<PublicProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({ subject: '', message: '' });

  useEffect(() => {
    const fetchProfessionalProfile = async () => {
      if (!professionalId) {
        setError('Professional ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            is_professional,
            professional_headline,
            professional_bio,
            professional_firm_name,
            professional_location,
            professional_specializations,
            professional_website,
            avatar_url
          `)
          .eq('id', professionalId)
          .eq('is_professional', true)
          .single();

        if (error) {
          console.error('Error fetching professional profile:', error);
          throw new Error(error.message || 'Failed to fetch professional profile');
        }

        if (!data) {
          setError('Professional profile not found');
        } else {
          setProfile(data as PublicProfessionalProfile);
        }
      } catch (err: any) {
        console.error('Error in fetchProfessionalProfile:', err);
        setError(`Failed to load professional profile: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionalProfile();
  }, [professionalId]);

  const handleContactClick = () => {
    setContactDialogOpen(true);
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this message to the professional
    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${profile?.name}.`,
    });
    setContactDialogOpen(false);
    setMessageForm({ subject: '', message: '' });
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
        <div className="container mx-auto py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading professional profile...</span>
        </div>
      </AppLayout>
    );
  }

  if (error || !profile) {
    return (
      <AppLayout>
        <div className="container mx-auto py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-medium text-red-800 mb-2">Error Loading Profile</h2>
            <p className="text-red-700">{error || 'Profile not found'}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/professionals">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button asChild variant="outline" className="mb-4">
            <Link to="/professionals">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Professional Profile</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.name} />
                ) : (
                  <AvatarFallback className="text-2xl">{getNameInitials(profile.name)}</AvatarFallback>
                )}
              </Avatar>
              <CardTitle className="mt-4">{profile.name}</CardTitle>
              {profile.professional_headline && (
                <CardDescription className="text-center mt-1">{profile.professional_headline}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.professional_firm_name && (
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile.professional_firm_name}</span>
                </div>
              )}
              {profile.professional_location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile.professional_location}</span>
                </div>
              )}
              {profile.professional_website && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                  <a 
                    href={profile.professional_website.startsWith('http') ? profile.professional_website : `https://${profile.professional_website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {profile.professional_website}
                  </a>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleContactClick} className="w-full">
                Contact {profile.name.split(' ')[0]}
              </Button>
            </CardFooter>
          </Card>

          {/* Profile Main Content */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.professional_bio ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground">{profile.professional_bio}</p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No bio provided</p>
              )}

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Specializations</h3>
                {profile.professional_specializations && profile.professional_specializations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.professional_specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary">{spec}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No specializations listed</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {profile.name}</DialogTitle>
            <DialogDescription>
              Send a message to this professional regarding your business needs.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleMessageSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief subject of your inquiry"
                value={messageForm.subject}
                onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe what you need assistance with..."
                rows={5}
                value={messageForm.message}
                onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
                required
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setContactDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Send Message
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ProfessionalProfilePage;
