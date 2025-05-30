
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
    askingPrice: '',
    targetCompletionDate: '',
    dealDescription: '',
    keyAssetsIncluded: '',
    keyAssetsExcluded: '',
    reasonForSelling: '',
    
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
