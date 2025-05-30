
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { dealsService } from '@/services/dealsService';
import { DealCreationData } from '../types';

export const useDealSubmission = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: DealCreationData) => {
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
    
    try {
      const dealData = {
        title: formData.dealTitle,
        description: formData.dealDescription,
        asking_price: formData.askingPrice ? parseFloat(formData.askingPrice) : undefined,
        business_industry: formData.businessIndustry,
        target_completion_date: formData.targetCompletionDate,
        status: 'draft' as const,
        health_score: 50,
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
      };

      const newDeal = await dealsService.createDeal(dealData);
      
      console.log('Deal created successfully:', newDeal);
      toast({
        title: "Deal Created Successfully!",
        description: "Your business sale is now live and ready for collaboration.",
      });
      
      navigate(`/deals/${newDeal.id}`);
    } catch (error: any) {
      console.error('Error creating deal:', error);
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
