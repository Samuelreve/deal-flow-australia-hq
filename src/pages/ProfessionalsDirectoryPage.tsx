
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import ProfessionalCard from '@/components/professionals/ProfessionalCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { UserProfile } from '@/types/auth';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const fetchProfessionals = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_professional', true);

  if (error) {
    throw new Error(error.message);
  }

  return data as UserProfile[];
};

const ProfessionalsDirectoryPage = () => {
  const { data: professionals = [], isLoading, error } = useQuery({
    queryKey: ['professionals'],
    queryFn: fetchProfessionals,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<UserProfile | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({ subject: '', message: '' });
  const { toast } = useToast();
  
  const filteredProfessionals = professionals.filter(professional => {
    const searchLower = searchTerm.toLowerCase();
    return (
      professional.name?.toLowerCase().includes(searchLower) ||
      professional.professional_headline?.toLowerCase().includes(searchLower) ||
      professional.professional_firm_name?.toLowerCase().includes(searchLower) ||
      professional.professional_location?.toLowerCase().includes(searchLower) ||
      (Array.isArray(professional.professional_specializations) && 
        professional.professional_specializations.some(spec => 
          spec.toLowerCase().includes(searchLower)
        ))
    );
  });

  const handleContactClick = (professional: UserProfile) => {
    setSelectedProfessional(professional);
    setContactDialogOpen(true);
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this message to the professional
    // For now, we'll just show a toast
    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${selectedProfessional?.name}.`,
    });
    setContactDialogOpen(false);
    setMessageForm({ subject: '', message: '' });
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Professional Directory</h1>
          <p className="text-muted-foreground mt-2">
            Connect with lawyers and advisors specializing in business deals and transactions.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Find Professionals</CardTitle>
            <CardDescription>
              Search by name, specialization, location, or firm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Search professionals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => setSearchTerm('')} variant="outline">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <p className="animate-pulse">Loading professionals...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">
            <p>Error loading professionals directory. Please try again later.</p>
          </div>
        ) : filteredProfessionals.length === 0 ? (
          <div className="p-8 text-center">
            <p>No professionals found matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                onContactClick={handleContactClick}
              />
            ))}
          </div>
        )}
      </div>
      
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {selectedProfessional?.name}</DialogTitle>
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

export default ProfessionalsDirectoryPage;
