
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DealCreationData } from '../types';

export const useWizardState = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<DealCreationData>({
    // Business Information
    businessTradingName: '',
    businessLegalName: '',
    legalEntityType: '',
    abn: '',
    acn: '',
    registeredAddress: '',
    principalAddress: '',
    businessState: '',
    businessIndustry: '',
    yearsInOperation: 0,
    
    // Deal Information
    dealTitle: '',
    dealType: '',
    dealCategory: 'business_sale',
    askingPrice: '',
    targetCompletionDate: '',
    dealDescription: '',
    keyAssetsIncluded: '',
    keyAssetsExcluded: '',
    reasonForSelling: '',
    
    // Category-specific fields
    ipAssets: [],
    propertyDetails: {
      propertyType: 'residential',
      address: '',
      sqm: undefined,
      zoning: '',
      council: '',
      currentUse: '',
      proposedUse: '',
      settlementDate: '',
      contractConditions: []
    },
    crossBorderDetails: {
      buyerCountry: '',
      sellerCountry: '',
      regulatoryApprovals: [],
      taxImplications: '',
      currencyExchange: '',
      complianceRequirements: []
    },
    microDealDetails: {
      itemType: '',
      condition: 'good',
      authenticity: 'unknown',
      rarity: 'common',
      provenance: '',
      certifications: []
    },
    
    // Seller Details - Initialize with user data
    primarySellerName: user?.profile?.name || user?.name || '',
    sellerEntityType: '',
    legalRepName: '',
    legalRepEmail: '',
    legalRepPhone: '',
    
    // Documents
    uploadedDocuments: []
  });

  const updateFormData = (stepData: Partial<DealCreationData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    console.log('Form data updated:', { ...formData, ...stepData });
  };

  return {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData
  };
};
