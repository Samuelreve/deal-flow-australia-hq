
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
            asking_price: formData.askingPrice ? parseFloat(formData.askingPrice.replace(/,/g, '')) : null,
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
            asking_price: formData.askingPrice ? parseFloat(formData.askingPrice.replace(/,/g, '')) : null,
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

      // Milestones will be created only when user explicitly generates them

      // Migrate temporary documents to the final deal
      if (tempDealId && formData.uploadedDocuments && formData.uploadedDocuments.length > 0) {
        console.log('Migrating temporary documents to final deal:', finalDealId);
        console.log('Temp deal ID:', tempDealId);
        console.log('Documents to migrate:', formData.uploadedDocuments.length);
        
        try {
          // Call the migration edge function to move files from temp to real deal paths
          const { data: migrationResult, error: migrationError } = await supabase.functions.invoke(
            'migrate-temp-documents',
            {
              body: {
                tempDealId: tempDealId,
                realDealId: finalDealId
              }
            }
          );

          if (migrationError) {
            console.error('Error migrating documents:', migrationError);
            toast({
              title: "Document Migration Warning",
              description: "Deal created but some documents may need manual review.",
              variant: "default"
            });
          } else {
            console.log('Document migration completed successfully:', migrationResult);
            // Verify migration was successful
            const { data: migratedDocs } = await supabase
              .from('documents')
              .select('id, name, deal_id')
              .eq('deal_id', finalDealId);
            
            console.log('Documents now linked to final deal:', migratedDocs?.length);
          }
        } catch (migrationErr) {
          console.error('Error calling migration function:', migrationErr);
          // Don't fail the whole operation, just warn the user
          toast({
            title: "Document Migration Warning", 
            description: "Deal created but some documents may need manual review.",
            variant: "default"
          });
        }
      } else if (formData.uploadedDocuments && formData.uploadedDocuments.length > 0) {
        // For non-temp deals, just verify document linkage
        console.log('Verifying document linkage for deal:', finalDealId);
        console.log('Documents to verify:', formData.uploadedDocuments.length);
        
        const { data: existingDocs } = await supabase
          .from('documents')
          .select('id, deal_id')
          .in('id', formData.uploadedDocuments.map(doc => doc.id));
          
        console.log('Found existing documents:', existingDocs?.length);

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
