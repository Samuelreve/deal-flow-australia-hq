
export interface DealCreationData {
  // Business Information
  businessTradingName: string;
  businessLegalName: string;
  legalEntityType: string;
  abn: string;
  acn: string;
  registeredAddress: string;
  principalAddress: string;
  businessState: string;
  businessIndustry: string;
  yearsInOperation: number;
  
  // Deal Information
  dealTitle: string;
  dealType: string;
  askingPrice: string;
  targetCompletionDate: string;
  dealDescription: string;
  keyAssetsIncluded: string;
  keyAssetsExcluded: string;
  reasonForSelling: string;
  
  // Seller Details
  primarySellerName: string;
  sellerEntityType: string;
  legalRepName: string;
  legalRepEmail: string;
  legalRepPhone: string;
  
  // Documents
  uploadedDocuments: UploadedDocument[];
  
  // Internal tracking
  tempDealId?: string;
}

export interface UploadedDocument {
  id: string;
  filename: string;
  type: string;
  category: string;
  size: number;
  uploadedAt: Date;
  url?: string;
  storagePath?: string; // Added for storage management
}

export interface StepProps {
  data: DealCreationData;
  updateData: (data: Partial<DealCreationData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isLastStep: boolean;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

// Enhanced constants for the new wizard
export const LEGAL_ENTITY_TYPES = [
  'Pty Ltd',
  'Sole Trader',
  'Partnership',
  'Trust',
  'Other'
];

// Add ENTITY_TYPES as an alias for backward compatibility
export const ENTITY_TYPES = LEGAL_ENTITY_TYPES;

export const BUSINESS_STATES = [
  'ACT',
  'NSW', 
  'NT',
  'QLD',
  'SA',
  'TAS',
  'VIC',
  'WA'
];

export const BUSINESS_INDUSTRIES = [
  'Hospitality',
  'Retail',
  'Technology',
  'Healthcare',
  'Construction',
  'Manufacturing',
  'Professional Services',
  'Real Estate',
  'Finance',
  'Education',
  'Other'
];

export const DEAL_TYPES = [
  'Asset Sale',
  'Share Sale',
  'Business Sale',
  'Franchise Sale',
  'Other'
];

export const SELLING_REASONS = [
  'Retirement',
  'New Venture',
  'Burnout',
  'Relocation',
  'Health Reasons',
  'Business Growth',
  'Market Conditions',
  'Other'
];

export const SELLER_ENTITY_TYPES = [
  'Individual',
  'Company',
  'Trust',
  'Other'
];

export const DOCUMENT_CATEGORIES = [
  'Certificate of Registration',
  'ABN/ACN Confirmation',
  'Financial Statements',
  'Lease Agreements',
  'Asset List',
  'Business Valuation',
  'Key Contracts',
  'Seller ID',
  'Other'
];

export const REQUIRED_DOCUMENTS = [
  'Certificate of Registration',
  'Seller ID'
];

export const RECOMMENDED_DOCUMENTS = [
  'Financial Statements',
  'Business Valuation',
  'Asset List'
];
