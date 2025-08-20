
import { DealCreationData } from '../../types';

export const validateBusinessInfoStep = (data: DealCreationData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Check which fields are required based on deal category
  const categoryRequiresLegalName = ['business_sale', 'ip_transfer', 'cross_border'].includes(data.dealCategory);
  
  if (!data.businessTradingName) {
    errors.businessTradingName = 'Business trading name is required';
  }
  
  // Legal name is required for specific categories
  if (categoryRequiresLegalName && !data.businessLegalName) {
    errors.businessLegalName = 'Business legal name is required for this deal category';
  }
  
  if (!data.legalEntityType) {
    errors.legalEntityType = 'Legal entity type is required';
  }
  
  if (!data.businessIndustry) {
    errors.businessIndustry = 'Business industry is required';
  }
  
  // ABN validation (AU format)
  if (data.abn && !/^\d{2}\s\d{3}\s\d{3}\s\d{3}$/.test(data.abn)) {
    errors.abn = 'ABN must be in format: 12 345 678 901';
  }
  
  // ACN validation (9 digits)
  if (data.acn && !/^\d{3}\s\d{3}\s\d{3}$/.test(data.acn)) {
    errors.acn = 'ACN must be in format: 123 456 789';
  }

  if (data.yearsInOperation < 0) {
    errors.yearsInOperation = 'Years in operation cannot be negative';
  }

  return errors;
};
