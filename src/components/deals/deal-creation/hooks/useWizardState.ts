
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
    currency: 'AUD', // Default to AUD
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
      contractConditions: [],
      stage: 'offer' // required field
    },
    crossBorderDetails: {
      buyerCountry: '',
      sellerCountry: '',
      counterpartyCountry: '', // required field
      regulatoryApprovals: [],
      taxImplications: '',
      currencyExchange: '',
      complianceRequirements: [],
      incoterms: '',
      currency: 'AUD', // required field with default
      regulatoryFlags: []
    },
    microDealDetails: {
      itemType: '',
      itemName: '',
      condition: 'new',
      authenticity: 'unknown',
      rarity: 'common',
      authenticityNotes: '',
      certifications: [],
      escrowOptIn: false
    },
    
    // Seller Details - Initialize with user data
    primarySellerName: user?.profile?.name || user?.name || '',
    sellerEntityType: '',
    legalRepName: '',
    legalRepEmail: '',
    legalRepPhone: '',
    jurisdiction: '',
    counterpartyCountry: '',
    buyerName: '',
    buyerEmail: '',
    
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
