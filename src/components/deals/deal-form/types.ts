
import { UserRole } from '@/types/auth';

// Define the shape of the form data
export interface DealFormData {
  // Business Details
  businessName: string;
  businessLegalName: string;
  businessTradingNames: string;
  businessLegalEntity: string;
  businessIdentifier: string; // ABN/ACN
  businessABN: string;
  businessACN: string;
  businessRegisteredAddress: string;
  businessPrincipalAddress: string;
  businessState: string;
  industry: string;
  yearsInOperation: string;
  
  // Deal Info
  title: string;
  description: string;
  askingPrice: string;
  dealType: string;
  keyAssetsIncluded: string;
  keyAssetsExcluded: string;
  reasonForSelling: string;
  targetCompletionDate: string;
  
  // Seller Info (if different from user)
  sellerName: string;
  sellerEntityType: string;
  sellerRepresentative: string;
}
