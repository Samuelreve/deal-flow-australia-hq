
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DealCreationData } from '../types';
import { useDocumentAI } from '@/hooks/useDocumentAI';

export const useDealSubmission = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [isSavingDocument, setIsSavingDocument] = useState(false);
  const [currentDealId, setCurrentDealId] = useState<string | null>(null);
  
  const { generateSmartTemplate } = useDocumentAI({
    dealId: currentDealId || ''
  });

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
            target_completion_date: formData.targetCompletionDate || null,
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
            deal_category: formData.dealCategory as any,
            key_assets_included: formData.keyAssetsIncluded,
            key_assets_excluded: formData.keyAssetsExcluded,
            reason_for_selling: formData.reasonForSelling,
            primary_seller_contact_name: formData.primarySellerName,
            // Category-specific fields
            ip_assets: formData.dealCategory === 'ip_transfer' && formData.ipAssets?.length > 0 ? { assets: formData.ipAssets } as any : null,
            property_details: formData.dealCategory === 'real_estate' && formData.propertyDetails ? formData.propertyDetails as any : null,
            cross_border_details: formData.dealCategory === 'cross_border' && formData.crossBorderDetails ? formData.crossBorderDetails as any : null,
            micro_deal_details: formData.dealCategory === 'micro_deals' && formData.microDealDetails ? formData.microDealDetails as any : null,
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
            target_completion_date: formData.targetCompletionDate || null,
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
            deal_category: formData.dealCategory as any,
            key_assets_included: formData.keyAssetsIncluded,
            key_assets_excluded: formData.keyAssetsExcluded,
            reason_for_selling: formData.reasonForSelling,
            primary_seller_contact_name: formData.primarySellerName,
            // Category-specific fields
            ip_assets: formData.dealCategory === 'ip_transfer' && formData.ipAssets?.length > 0 ? { assets: formData.ipAssets } as any : null,
            property_details: formData.dealCategory === 'real_estate' && formData.propertyDetails ? formData.propertyDetails as any : null,
            cross_border_details: formData.dealCategory === 'cross_border' && formData.crossBorderDetails ? formData.crossBorderDetails as any : null,
            micro_deal_details: formData.dealCategory === 'micro_deals' && formData.microDealDetails ? formData.microDealDetails as any : null
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
            console.log('Document migration completed:', migrationResult);
            
            // Update document categories based on the form data
            console.log('Updating document categories with correct values...');
            for (const uploadedDoc of formData.uploadedDocuments) {
              if (uploadedDoc.category && uploadedDoc.category !== 'Other') {
                const { error: categoryUpdateError } = await supabase
                  .from('documents')
                  .update({ category: uploadedDoc.category })
                  .eq('name', uploadedDoc.filename)
                  .eq('deal_id', finalDealId);
                
                if (categoryUpdateError) {
                  console.warn('Error updating document category:', categoryUpdateError);
                } else {
                  console.log(`Updated category for ${uploadedDoc.filename} to ${uploadedDoc.category}`);
                }
              }
            }
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
        description: "Generating contract document...",
      });

      // Generate contract document using AI
      setCurrentDealId(finalDealId);
      await generateContractDocument(finalDealId, formData);
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

  const generateContractDocument = async (dealId: string, formData: DealCreationData) => {
    try {
      console.log('Generating contract document for deal:', dealId);
      
      // Build context from deal data and uploaded documents
      const dealContext = {
        dealTitle: formData.dealTitle,
        businessName: formData.businessLegalName || formData.businessTradingName,
        askingPrice: formData.askingPrice,
        dealType: formData.dealType,
        businessIndustry: formData.businessIndustry,
        dealCategory: formData.dealCategory,
        keyAssetsIncluded: formData.keyAssetsIncluded,
        keyAssetsExcluded: formData.keyAssetsExcluded,
        reasonForSelling: formData.reasonForSelling,
        primarySellerName: formData.primarySellerName,
        hasUploadedDocuments: formData.uploadedDocuments && formData.uploadedDocuments.length > 0,
        documentCount: formData.uploadedDocuments?.length || 0
      };

      const result = await generateSmartTemplate(
        dealId,
        'Business Sale Contract',
        'Generate a comprehensive business sale contract incorporating the deal information and any uploaded documents'
      );

      if (result && result.template) {
        setGeneratedDocument(result.template);
        setShowDocumentPreview(true);
      } else {
        // If generation fails, continue to deal room
        navigate(`/deals/${dealId}`);
      }
    } catch (error) {
      console.error('Error generating contract document:', error);
      toast({
        title: "Contract Generation Info",
        description: "Deal created successfully. You can generate documents from the deal room.",
        variant: "default"
      });
      navigate(`/deals/${dealId}`);
    }
  };

  const handleDocumentSave = async (content: string, filename: string, category: string) => {
    if (!currentDealId) return;
    
    setIsSavingDocument(true);
    try {
      // Create document record in database
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          deal_id: currentDealId,
          name: filename,
          category: category,
          uploaded_by: user?.id,
          storage_path: `${currentDealId}/${filename}`,
          size: new Blob([content]).size,
          type: 'text/plain'
        })
        .select()
        .single();

      if (docError) throw docError;

      // Create document version with the content
      const { error: versionError } = await supabase
        .from('document_versions')
        .insert({
          document_id: document.id,
          version_number: 1,
          storage_path: `${currentDealId}/${filename}`,
          size: new Blob([content]).size,
          type: 'text/plain',
          uploaded_by: user?.id,
          description: 'AI-generated contract document'
        });

      if (versionError) throw versionError;

      // Upload the actual file content to storage
      const { error: uploadError } = await supabase.storage
        .from('deal_documents')
        .upload(`${currentDealId}/${filename}`, new Blob([content], { type: 'text/plain' }));

      if (uploadError) throw uploadError;

      toast({
        title: "Contract Saved!",
        description: "AI-generated contract has been added to your deal documents.",
      });

      setShowDocumentPreview(false);
      navigate(`/deals/${currentDealId}`);
    } catch (error: any) {
      console.error('Error saving generated document:', error);
      toast({
        title: "Error Saving Document",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSavingDocument(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
    showDocumentPreview,
    generatedDocument,
    handleDocumentSave,
    isSavingDocument
  };
};
