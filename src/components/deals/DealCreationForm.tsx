
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Define the shape of the form data
interface DealFormData {
  title: string;
  businessName: string;
  description: string;
}

const DealCreationForm: React.FC = () => {
  const { user } = useAuth();
  
  // State to manage form input values
  const [formData, setFormData] = useState<DealFormData>({
    title: '',
    businessName: '',
    description: '',
  });

  // State for loading and error states during form submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Hook for navigation after successful deal creation
  const navigate = useNavigate();

  // Handles changes in form input fields
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Handles the form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Basic validation
    if (!formData.title || !formData.businessName || !formData.description) {
      setSubmitError('Please fill in all required fields.');
      toast.error('Please fill in all required fields.');
      return;
    }

    // Ensure user is logged in before attempting to create a deal
    if (!user) {
      setSubmitError('You must be logged in to create a deal.');
      toast.error('Authentication error. Please log in again.');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      console.log('Creating deal with user ID:', user.id);
      console.log('User profile:', user.profile);
      
      // Create the deal in Supabase
      const { data: newDeal, error } = await supabase
        .from('deals')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            seller_id: user.id,
            status: 'draft',
            health_score: 0 // Default value
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
      setSubmitError(`Failed to create deal: ${error.message}`);
      toast.error(`Failed to create deal: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create New Business Deal</h2>

      {/* Form for deal details */}
      <form onSubmit={handleSubmit}>
        {/* Deal Name Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="title">
            Deal Name
          </label>
          <Input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="title"
            type="text"
            name="title"
            placeholder="e.g., Sale of 'Coastal Cafe'"
            value={formData.title}
            onChange={handleInputChange}
            required
            disabled={submitting}
          />
        </div>

        {/* Business Name Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="businessName">
            Business Name
          </label>
          <Input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="businessName"
            type="text"
            name="businessName"
            placeholder="e.g., Coastal Cafe Pty Ltd"
            value={formData.businessName}
            onChange={handleInputChange}
            required
            disabled={submitting}
          />
        </div>

        {/* Short Description Textarea */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="description">
            Short Description
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
            id="description"
            name="description"
            placeholder="Provide a brief description of the business..."
            value={formData.description}
            onChange={handleInputChange}
            required
            disabled={submitting}
          ></textarea>
        </div>

        {/* Submit Error Message */}
        {submitError && (
          <p className="text-red-500 text-xs italic mb-4 text-center">{submitError}</p>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-center">
          <Button
            className={`w-full ${submitting || !user ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={submitting || !user}
          >
            {submitting ? 'Creating Deal...' : 'Create Deal'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DealCreationForm;
