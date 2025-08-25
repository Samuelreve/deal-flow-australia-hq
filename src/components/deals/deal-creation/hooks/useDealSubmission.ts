
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

  const handleSubmit = async (formData: DealCreationData, tempDealId?: string, autoGenerateContract: boolean = true) => {
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
        description: autoGenerateContract 
          ? "Your deal has been created. Now generating contract document..." 
          : "Your deal has been created successfully.",
      });

      // Generate contract document using AI only if enabled
      if (autoGenerateContract) {
        setCurrentDealId(finalDealId);
        await generateContractDocument(finalDealId, formData);
      } else {
        // Navigate directly to deal room without generating contract
        navigate(`/deals/${finalDealId}`);
      }
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
      
      toast({
        title: "Generating Contract",
        description: "Please wait while we generate your contract document...",
      });
      
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
        businessState: formData.businessState,
        legalEntityType: formData.legalEntityType,
        abn: formData.abn,
        acn: formData.acn,
        yearsInOperation: formData.yearsInOperation,
        targetCompletionDate: formData.targetCompletionDate,
        // Document information
        hasUploadedDocuments: formData.uploadedDocuments && formData.uploadedDocuments.length > 0,
        documentCount: formData.uploadedDocuments?.length || 0,
        uploadedDocuments: formData.uploadedDocuments?.map(doc => ({
          filename: doc.filename,
          category: doc.category,
          type: doc.type
        })) || [],
        // Category-specific data
        ipAssets: formData.dealCategory === 'ip_transfer' ? formData.ipAssets : undefined,
        propertyDetails: formData.dealCategory === 'real_estate' ? formData.propertyDetails : undefined,
        crossBorderDetails: formData.dealCategory === 'cross_border' ? formData.crossBorderDetails : undefined,
        microDealDetails: formData.dealCategory === 'micro_deals' ? formData.microDealDetails : undefined
      };

      // Generate category-specific template type and prompt
      const getTemplateTypeAndPrompt = (category: string) => {
        switch (category) {
          case 'ip_transfer':
            return {
              templateType: 'IP Transfer Agreement',
              prompt: `Generate a comprehensive IP transfer agreement for ${formData.ipAssets?.map(ip => ip.name).join(', ') || 'intellectual property assets'}. Include specific IP transfer clauses, warranties, and jurisdiction-specific requirements.`
            };
          case 'real_estate':
            return {
              templateType: 'Property Sale Contract',
              prompt: `Generate a property sale contract for ${formData.propertyDetails?.propertyType || 'property'} located at ${formData.propertyDetails?.address || 'the specified address'}. Include property-specific conditions, settlement terms, and regulatory compliance.`
            };
          case 'cross_border':
            return {
              templateType: 'Cross-Border Transaction Agreement',
              prompt: `Generate a cross-border transaction agreement between ${formData.crossBorderDetails?.sellerCountry || 'Australia'} and ${formData.crossBorderDetails?.buyerCountry || 'the buyer country'}. Include regulatory approvals, tax implications, and compliance requirements.`
            };
          case 'micro_deals':
            return {
              templateType: 'Item Sale Agreement',
              prompt: `Generate a sale agreement for ${formData.microDealDetails?.itemName || 'collectible item'}. Include condition details, authenticity verification, and escrow terms if applicable.`
            };
          case 'business_sale':
          default:
            return {
              templateType: 'Business Sale Agreement',
              prompt: `Generate a comprehensive business sale agreement for ${formData.businessLegalName || formData.businessTradingName} in the ${formData.businessIndustry} industry. Include asset transfer, liabilities, warranties, and completion terms.`
            };
        }
      };

      const { templateType, prompt } = getTemplateTypeAndPrompt(formData.dealCategory);

      const result = await generateSmartTemplate(
        dealId,
        templateType,
        prompt,
        dealContext
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
      // Get the file extension from filename
      const fileExtension = filename.split('.').pop()?.toLowerCase() || 'txt';
      
      // Determine MIME type based on file extension
      const getMimeType = (extension: string) => {
        switch (extension) {
          case 'pdf':
            return 'application/pdf';
          case 'docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          case 'doc':
            return 'application/msword';
          case 'txt':
          default:
            return 'text/plain';
        }
      };

      const mimeType = getMimeType(fileExtension);
      let contentBlob: Blob;

      // Generate appropriate content based on file type
      if (fileExtension === 'pdf') {
        // Generate PDF content
        const jsPDF = (await import('jspdf')).default;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margins = 20;
        const maxLineWidth = pageWidth - (margins * 2);
        
        const lines = content.split('\n');
        let yPosition = margins;
        const lineHeight = 7;
        
        doc.setFontSize(10);
        
        lines.forEach((line) => {
          if (yPosition > doc.internal.pageSize.getHeight() - margins) {
            doc.addPage();
            yPosition = margins;
          }
          
          if (line.trim() === '') {
            yPosition += lineHeight;
            return;
          }
          
          const wrappedLines = doc.splitTextToSize(line, maxLineWidth);
          wrappedLines.forEach((wrappedLine: string) => {
            if (yPosition > doc.internal.pageSize.getHeight() - margins) {
              doc.addPage();
              yPosition = margins;
            }
            doc.text(wrappedLine, margins, yPosition);
            yPosition += lineHeight;
          });
        });
        
        contentBlob = doc.output('blob');
      } else if (fileExtension === 'docx') {
        // Generate DOCX content
        const { Document, Packer, Paragraph, TextRun } = await import('docx');
        
        const lines = content.split('\n');
        const paragraphs: any[] = [];
        
        lines.forEach((line) => {
          const trimmedLine = line.trim();
          
          if (trimmedLine === '') {
            paragraphs.push(new Paragraph({ text: '' }));
            return;
          }
          
          const textRuns: any[] = [];
          const parts = trimmedLine.split(/(\b[A-Z]{2,}\b)/);
          parts.forEach((part) => {
            if (/^[A-Z]{2,}$/.test(part)) {
              textRuns.push(new TextRun({ text: part, bold: true }));
            } else {
              textRuns.push(new TextRun({ text: part }));
            }
          });
          
          paragraphs.push(new Paragraph({ children: textRuns }));
        });
        
        const doc = new Document({
          sections: [{ properties: {}, children: paragraphs }],
        });
        
        contentBlob = await Packer.toBlob(doc);
      } else {
        // Text content
        contentBlob = new Blob([content], { type: mimeType });
      }

      // Create document record in database
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          deal_id: currentDealId,
          name: filename,
          category: category,
          uploaded_by: user?.id,
          storage_path: `${currentDealId}/${filename}`,
          size: contentBlob.size,
          type: mimeType
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
          size: contentBlob.size,
          type: mimeType,
          uploaded_by: user?.id,
          description: 'AI-generated contract document'
        });

      if (versionError) throw versionError;

      // Upload the actual file content to storage
      const { error: uploadError } = await supabase.storage
        .from('deal_documents')
        .upload(`${currentDealId}/${filename}`, contentBlob);

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
