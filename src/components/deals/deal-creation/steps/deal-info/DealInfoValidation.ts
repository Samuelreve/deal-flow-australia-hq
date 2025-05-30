
import { DealCreationData } from '../../types';

export const validateDealInfoStep = (data: DealCreationData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.dealTitle) {
    errors.dealTitle = 'Deal title is required';
  }
  
  if (!data.dealDescription) {
    errors.dealDescription = 'Deal description is required';
  }
  
  if (!data.dealType) {
    errors.dealType = 'Deal type is required';
  }

  return errors;
};
