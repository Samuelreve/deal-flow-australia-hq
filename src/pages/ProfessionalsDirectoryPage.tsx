
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import ProfessionalCard from '@/components/professionals/ProfessionalCard';
import ProfessionalSearchFilters, { ProfessionalFilters } from '@/components/professionals/ProfessionalSearchFilters';
import ProfessionalDirectoryPagination from '@/components/professionals/ProfessionalDirectoryPagination';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserProfile } from '@/types/auth';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FetchProfessionalsParams {
  searchTerm?: string;
  location?: string;
  specialization?: string;
  page: number;
  limit: number;
}

const fetchProfessionals = async ({ searchTerm, location, specialization, page, limit }: FetchProfessionalsParams) => {
  // Start building the query
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('is_professional', true);

  // Apply filters
  if (searchTerm) {
    const searchLower = `%${searchTerm.toLowerCase()}%`;
    query = query.or(
      `name.ilike.${searchLower},professional_headline.ilike.${searchLower},professional_firm_name.ilike.${searchLower}`
    );
  }

  if (location) {
    query = query.ilike('professional_location', `%${location}%`);
  }

  if (specialization) {
    // If professional_specializations is a JSONB array, we can use contains
    query = query.contains('professional_specializations', [specialization]);
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await query
    .range(from, to)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return { 
    professionals: data as UserProfile[], 
    totalCount: count || 0 
  };
};

const ProfessionalsDirectoryPage = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  
  // Filter state
  const [filters, setFilters] = useState<ProfessionalFilters>({
    searchTerm: '',
    location: undefined,
    specialization: undefined
  });

  const [selectedProfessional, setSelectedProfessional] = useState<UserProfile | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({ subject: '', message: '' });
  const { toast } = useToast();
  
  // Query professionals with filters and pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ['professionals', filters, currentPage, itemsPerPage],
    queryFn: () => fetchProfessionals({
      searchTerm: filters.searchTerm,
      location: filters.location,
      specialization: filters.specialization,
      page: currentPage,
      limit: itemsPerPage
    }),
  });

  const professionals = data?.professionals || [];
  const totalProfessionals = data?.totalCount || 0;
  const totalPages = Math.ceil(totalProfessionals / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFiltersChange = (newFilters: ProfessionalFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

        <ProfessionalSearchFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange} 
          isLoading={isLoading} 
        />

        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <p className="animate-pulse">Loading professionals...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">
              <p>Error loading professionals directory. Please try again later.</p>
            </div>
          ) : professionals.length === 0 ? (
            <div className="p-8 text-center">
              <p>No professionals found matching your search criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    onContactClick={handleContactClick}
                  />
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <ProfessionalDirectoryPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              </div>
              
              {totalProfessionals > 0 && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalProfessionals)} - {Math.min(currentPage * itemsPerPage, totalProfessionals)} of {totalProfessionals} professionals
                </p>
              )}
            </>
          )}
        </div>
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
