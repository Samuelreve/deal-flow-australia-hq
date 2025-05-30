
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

      // Create default milestones for the deal
      const defaultMilestones = [
        { title: 'Initial Review', description: 'Review deal documentation and requirements', order_index: 1 },
        { title: 'Due Diligence', description: 'Conduct thorough due diligence process', order_index: 2 },
        { title: 'Negotiation', description: 'Negotiate terms and conditions', order_index: 3 },
        { title: 'Legal Review', description: 'Legal review of all documents', order_index: 4 },
        { title: 'Completion', description: 'Finalize and complete the transaction', order_index: 5 }
      ];

      const { error: milestonesError } = await supabase
        .from('milestones')
        .insert(
          defaultMilestones.map(milestone => ({
            ...milestone,
            deal_id: finalDealId,
            status: 'not_started'
          }))
        );

      if (milestonesError) {
        console.warn('Error creating default milestones:', milestonesError);
        // Don't fail the whole operation
      }

      // Verify all uploaded documents are properly linked to the final deal
      if (formData.uploadedDocuments && formData.uploadedDocuments.length > 0) {
        console.log('Verifying document linkage for deal:', finalDealId);
        
        // Check if documents need to be updated to point to the final deal
        const { data: existingDocs } = await supabase
          .from('documents')
          .select('id, deal_id')
          .in('id', formData.uploadedDocuments.map(doc => doc.id));

        if (existingDocs) {
          const docsToUpdate = existingDocs.filter(doc => doc.deal_id !== finalDealId);
          
          if (docsToUpdate.length > 0) {
            console.log('Updating document deal_id for:', docsToUpdate.length, 'documents');
            
            const { error: updateDocsError } = await supabase
              .from('documents')
              .update({ deal_id: finalDealId })
              .in('id', docsToUpdate.map(doc => doc.id));

            if (updateDocsError) {
              console.warn('Error updating document deal_id:', updateDocsError);
            }
          }
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
