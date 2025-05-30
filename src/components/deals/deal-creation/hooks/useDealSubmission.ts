
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DealCreationData } from '../types';

export const useDealSubmission = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: DealCreationData, tempDealId?: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a deal.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Starting deal submission with data:', formData);
    console.log('Temp deal ID:', tempDealId);
    
    try {
      let finalDealId: string;

      if (tempDealId) {
        // Update the existing temporary deal with complete information
        const { data: updatedDeal, error: updateError } = await supabase
          .from('deals')
          .update({
            title: formData.dealTitle,
            description: formData.dealDescription,
            asking_price: formData.askingPrice ? parseFloat(formData.askingPrice) : null,
            business_industry: formData.businessIndustry,
            target_completion_date: formData.targetCompletionDate,
            status: 'active',
            business_legal_name: formData.businessLegalName,
            business_trading_names: formData.businessTradingName,
            business_legal_entity_type: formData.legalEntityType,
            business_abn: formData.abn,
            business_acn: formData.acn,
            business_registered_address: formData.registeredAddress,
            business_principal_place_address: formData.principalAddress,
            business_state: formData.businessState,
            business_years_in_operation: formData.yearsInOperation,
            deal_type: formData.dealType,
            key_assets_included: formData.keyAssetsIncluded,
            key_assets_excluded: formData.keyAssetsExcluded,
            reason_for_selling: formData.reasonForSelling,
            primary_seller_contact_name: formData.primarySellerName,
            updated_at: new Date().toISOString()
          })
          .eq('id', tempDealId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating deal:', updateError);
          throw updateError;
        }

        finalDealId = updatedDeal.id;
        console.log('Deal updated successfully:', updatedDeal);
      } else {
        // Create a new deal if no temp deal exists
        const { data: newDeal, error: createError } = await supabase
          .from('deals')
          .insert({
            title: formData.dealTitle,
            description: formData.dealDescription,
            asking_price: formData.askingPrice ? parseFloat(formData.askingPrice) : null,
            business_industry: formData.businessIndustry,
            target_completion_date: formData.targetCompletionDate,
            status: 'active',
            health_score: 50,
            seller_id: user.id,
            business_legal_name: formData.businessLegalName,
            business_trading_names: formData.businessTradingName,
            business_legal_entity_type: formData.legalEntityType,
            business_abn: formData.abn,
            business_acn: formData.acn,
            business_registered_address: formData.registeredAddress,
            business_principal_place_address: formData.principalAddress,
            business_state: formData.businessState,
            business_years_in_operation: formData.yearsInOperation,
            deal_type: formData.dealType,
            key_assets_included: formData.keyAssetsIncluded,
            key_assets_excluded: formData.keyAssetsExcluded,
            reason_for_selling: formData.reasonForSelling,
            primary_seller_contact_name: formData.primarySellerName
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating deal:', createError);
          throw createError;
        }

        finalDealId = newDeal.id;
        
        // Add the creator as a participant with admin role
        const { error: participantError } = await supabase
          .from('deal_participants')
          .insert({
            deal_id: finalDealId,
            user_id: user.id,
            role: 'admin'
          });

        if (participantError) {
          console.error('Error adding user as participant:', participantError);
          // Don't throw here, the deal is created, we can continue
        }

        console.log('Deal created successfully:', newDeal);
      }

      // Link any uploaded documents to the final deal
      if (formData.uploadedDocuments && formData.uploadedDocuments.length > 0) {
        console.log('Linking documents to deal:', formData.uploadedDocuments);
        
        // Note: Documents are already stored in storage with the tempDealId path
        // We don't need to move them, just ensure they're properly associated
        for (const doc of formData.uploadedDocuments) {
          console.log('Document already uploaded:', doc.filename);
        }
      }

      toast({
        title: "Deal Created Successfully!",
        description: "Your business sale is now live and ready for collaboration.",
      });
      
      navigate(`/deals/${finalDealId}`);
    } catch (error: any) {
      console.error('Error submitting deal:', error);
      toast({
        title: "Error Creating Deal",
        description: error.message || "Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
