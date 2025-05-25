
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DealFormData } from './types';
import { toast } from 'sonner';

export const useDealFormSubmit = () => {
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const submitDeal = async (data: DealFormData) => {
    if (!user) {
      toast.error('You must be logged in to create a deal');
      return;
    }

    setSubmitting(true);
    
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      // Create deal record
      const dealData = {
        title: data.title,
        description: data.description,
        asking_price: data.askingPrice ? parseFloat(data.askingPrice) : null,
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
        deal_type: data.dealType,
        key_assets_included: data.keyAssetsIncluded,
        key_assets_excluded: data.keyAssetsExcluded,
        reason_for_selling: data.reasonForSelling,
        target_completion_date: data.targetCompletionDate || null,
        primary_seller_contact_name: data.sellerName || user.profile?.name || user.email,
        seller_id: user.id,
        status: 'draft'
      };

      const { data: deal, error } = await supabase
        .from('deals')
        .insert(dealData)
        .select()
        .single();

      if (error) {
        console.error('Error creating deal:', error);
        toast.error('Failed to create deal', {
          description: error.message
        });
        return;
      }

      // Add the user as a participant
      const { error: participantError } = await supabase
        .from('deal_participants')
        .insert({
          deal_id: deal.id,
          user_id: user.id,
          role: 'seller'
        });

      if (participantError) {
        console.error('Error adding participant:', participantError);
        // Don't fail the whole operation for this
      }

      toast.success('Deal created successfully!', {
        description: 'Your deal has been created and you can now start managing it.'
      });

      // Navigate to the new deal
      navigate(`/deals/${deal.id}`);
      
    } catch (error: any) {
      console.error('Error submitting deal:', error);
      toast.error('Failed to create deal', {
        description: error.message || 'An unexpected error occurred'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    submitDeal
  };
};
