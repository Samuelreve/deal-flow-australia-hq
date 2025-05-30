
import { DealCreationData } from '../../types';

export const validateBusinessInfoStep = (data: DealCreationData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.businessTradingName) {
    errors.businessTradingName = 'Business trading name is required';
  }
  
  if (!data.businessLegalName) {
    errors.businessLegalName = 'Business legal name is required';
  }
  
  if (!data.legalEntityType) {
    errors.legalEntityType = 'Legal entity type is required';
  }
  
  if (!data.businessIndustry) {
    errors.businessIndustry = 'Business industry is required';
  }
  
  if (data.abn && !/^\d{2}\s\d{3}\s\d{3}\s\d{3}$/.test(data.abn)) {
    errors.abn = 'ABN must be in format: 12 345 678 901';
  }
  
  if (data.acn && !/^\d{3}\s\d{3}\s\d{3}$/.test(data.acn)) {
    errors.acn = 'ACN must be in format: 123 456 789';
  }

  if (data.yearsInOperation < 0) {
    errors.yearsInOperation = 'Years in operation cannot be negative';
  }

  return errors;
};
