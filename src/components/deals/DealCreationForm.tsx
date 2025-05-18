
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { LockIcon, InfoIcon, ArrowRightIcon, BuildingIcon, FileTextIcon, UserIcon } from 'lucide-react';

// Define the shape of the form data
interface DealFormData {
  // Business Details
  businessName: string;
  businessLegalEntity: string;
  businessIdentifier: string; // ABN/ACN
  industry: string;
  yearsInOperation: string;
  
  // Deal Info
  title: string;
  description: string;
  askingPrice: string;
  
  // Seller Info (if different from user)
  sellerName: string;
  sellerEntityType: string;
  sellerRepresentative: string;
}

const DealCreationForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  // Initialize form with useForm hook
  const form = useForm<DealFormData>({
    defaultValues: {
      businessName: '',
      businessLegalEntity: '',
      businessIdentifier: '',
      industry: '',
      yearsInOperation: '',
      title: '',
      description: '',
      askingPrice: '',
      sellerName: user?.profile?.name || '',
      sellerEntityType: '',
      sellerRepresentative: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: DealFormData) => {
    // Ensure user is logged in
    if (!user) {
      toast.error('Authentication error. Please log in again.');
      navigate('/login');
      return;
    }

    setSubmitting(true);

    try {
      console.log('Creating deal with user ID:', user.id);
      
      // Create the deal in Supabase
      const { data: newDeal, error } = await supabase
        .from('deals')
        .insert([
          {
            title: data.title,
            description: data.description,
            seller_id: user.id,
            status: 'draft',
            health_score: 0, // Default value
            // Store additional fields in the description for now
            // In a real-world scenario, we would create additional tables for these fields
            description: JSON.stringify({
              businessName: data.businessName,
              businessLegalEntity: data.businessLegalEntity,
              businessIdentifier: data.businessIdentifier,
              industry: data.industry,
              yearsInOperation: data.yearsInOperation,
              askingPrice: data.askingPrice,
              sellerName: data.sellerName,
              sellerEntityType: data.sellerEntityType,
              sellerRepresentative: data.sellerRepresentative,
              dealDescription: data.description
            })
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Deal creation error details:', error);
        throw error;
      }

      console.log('Deal created successfully:', newDeal);

      // Use the appropriate user role from the profile or default to seller
      const userRole = user.profile?.role as UserRole || 'seller';

      // Add the creator as a participant
      const { error: participantError } = await supabase
        .from('deal_participants')
        .insert({
          deal_id: newDeal.id,
          user_id: user.id,
          role: userRole
        });

      if (participantError) {
        console.error('Failed to add deal participant:', participantError);
        // Continue anyway since the deal was created
      }

      toast.success('Deal created successfully!');

      // Redirect to the new Deal Details page
      navigate(`/deals/${newDeal.id}`);
    } catch (error: any) {
      console.error('Deal creation error:', error);
      toast.error(`Failed to create deal: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Business Details Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <BuildingIcon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-medium">Business Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Coastal Cafe" {...field} />
                      </FormControl>
                      <FormDescription>
                        The trading name of the business
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessLegalEntity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Entity Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Coastal Cafe Pty Ltd" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessIdentifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Identifier (ABN/ACN)</FormLabel>
                      <FormControl>
                        <Input placeholder="12 345 678 901" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="Food & Beverage" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="yearsInOperation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years in Operation</FormLabel>
                      <FormControl>
                        <Input placeholder="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Deal Information Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FileTextIcon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-medium">Deal Information</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Sale of Coastal Cafe" required {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear name that identifies this transaction
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="askingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asking Price (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="$500,000" {...field} />
                      </FormControl>
                      <FormDescription>
                        You can update or refine this figure later
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide details about the business sale, including key assets, growth potential, and reason for sale..."
                          className="min-h-32"
                          required
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Seller Information Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <UserIcon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-medium">Seller Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="sellerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Seller Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Auto-filled from your profile
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sellerEntityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seller Entity Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Individual, Pty Ltd, Trust" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sellerRepresentative"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Representative (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Name and firm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col items-start border-t p-6 mt-2">
              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <LockIcon className="h-4 w-4" />
                <p>Your information is protected by enterprise-grade encryption and will only be shared with authorized participants.</p>
              </div>
            </CardFooter>
          </Card>
          
          {/* Next Steps and Submit */}
          <div className="flex flex-col items-center space-y-4 pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm max-w-xl text-center">
              <InfoIcon className="h-4 w-4 flex-shrink-0" />
              <p>After creating your deal, you'll be able to invite participants, upload documents, and track the deal progress through our secure platform.</p>
            </div>
            
            <Button 
              type="submit" 
              className="px-8 py-6 text-base"
              disabled={submitting}
            >
              {submitting ? 'Creating Deal...' : 'Initiate Secure Deal Process'}
              {!submitting && <ArrowRightIcon className="ml-2 h-5 w-5" />}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DealCreationForm;
