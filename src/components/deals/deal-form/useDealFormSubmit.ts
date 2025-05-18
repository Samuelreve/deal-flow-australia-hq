
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DealFormData } from './types';
import { UserRole } from '@/types/auth';

export const useDealFormSubmit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const submitDeal = async (data: DealFormData) => {
    // Ensure user is logged in
    if (!user) {
      toast.error('Authentication error. Please log in again.');
      navigate('/login');
      return;
    }

    setSubmitting(true);

    try {
      console.log('Creating deal with user ID:', user.id);
      
      // Create the deal in Supabase using the new schema
      const { data: newDeal, error } = await supabase
        .from('deals')
        .insert([
          {
            // Basic deal info
            title: data.title,
            seller_id: user.id,
            status: 'draft',
            health_score: 0,
            
            // Business structure and location
            business_legal_name: data.businessLegalName,
            business_trading_names: data.businessTradingNames,
            business_legal_entity_type: data.businessLegalEntity,
            business_abn: data.businessABN,
            business_acn: data.businessACN,
            business_registered_address: data.businessRegisteredAddress,
            business_principal_place_address: data.businessPrincipalAddress,
            business_state: data.businessState,
            business_industry: data.industry,
            business_years_in_operation: data.yearsInOperation ? parseInt(data.yearsInOperation) : null,
            
            // Deal structure and terms
            deal_type: data.dealType,
            asking_price: data.askingPrice ? parseFloat(data.askingPrice) : null,
            key_assets_included: data.keyAssetsIncluded,
            key_assets_excluded: data.keyAssetsExcluded,
            reason_for_selling: data.reasonForSelling,
            
            // Deal timeline
            target_completion_date: data.targetCompletionDate || null,
            
            // Seller info
            primary_seller_contact_name: data.sellerName,
            
            // Store detailed description separately
            description: data.description
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

  return { submitting, submitDeal };
};
