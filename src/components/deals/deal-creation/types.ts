
export interface DealCreationData {
  // Business Information
  businessTradingName: string;
  legalEntityName: string;
  entityType: string;
  abn: string;
  acn: string;
  registeredAddress: string;
  principalAddress: string;
  
  // Deal Information
  dealTitle: string;
  dealType: string;
  askingPrice: string;
  targetCompletionDate: string;
  dealDescription: string;
  assetsIncluded: string;
  assetsExcluded: string;
  reasonForSelling: string;
  
  // Seller Details
  sellerName: string;
  sellerEntityType: string;
  legalRepName: string;
  legalRepEmail: string;
  legalRepPhone: string;
  
  // Documents
  uploadedDocuments: UploadedDocument[];
}

export interface UploadedDocument {
  id: string;
  filename: string;
  type: string;
  size: number;
  uploadedAt: Date;
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

export const ENTITY_TYPES = [
  'Pty Ltd',
  'Sole Trader',
  'Trust',
  'Partnership',
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

export const DOCUMENT_TYPES = [
  'Certificate of Registration',
  'ABN/ACN Confirmation',
  'Financial Statements',
  'Lease Agreements',
  'Asset List',
  'Business Valuation',
  'Contracts',
  'Seller ID',
  'Other'
];
