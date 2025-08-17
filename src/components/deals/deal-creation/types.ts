
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
  dealCategory: string;
  askingPrice: string;
  targetCompletionDate: string;
  dealDescription: string;
  keyAssetsIncluded: string;
  keyAssetsExcluded: string;
  reasonForSelling: string;
  
  // Category-specific fields
  ipAssets: IPAsset[];
  propertyDetails: PropertyDetails;
  crossBorderDetails: CrossBorderDetails;
  microDealDetails: MicroDealDetails;
  
  // Seller Details
  primarySellerName: string;
  sellerEntityType: string;
  legalRepName: string;
  legalRepEmail: string;
  legalRepPhone: string;
  
  // Documents
  uploadedDocuments: UploadedDocument[];
}

export interface IPAsset {
  type: 'patent' | 'trademark' | 'copyright' | 'trade_secret' | 'domain' | 'other';
  name: string;
  description: string;
  registrationNumber?: string;
  expiryDate?: string;
  value?: string;
}

export interface PropertyDetails {
  propertyType: 'residential' | 'commercial' | 'industrial' | 'land' | 'other';
  address: string;
  sqm?: number;
  zoning?: string;
  council?: string;
  currentUse?: string;
  proposedUse?: string;
  settlementDate?: string;
  contractConditions?: string[];
}

export interface CrossBorderDetails {
  buyerCountry: string;
  sellerCountry: string;
  regulatoryApprovals: string[];
  taxImplications: string;
  currencyExchange: string;
  complianceRequirements: string[];
}

export interface MicroDealDetails {
  itemType: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  authenticity: 'verified' | 'unverified' | 'unknown';
  rarity: 'common' | 'uncommon' | 'rare' | 'ultra_rare';
  provenance?: string;
  certifications?: string[];
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

export const DEAL_CATEGORIES = [
  { value: 'business_sale', label: 'Business Sale', description: 'Traditional business acquisition' },
  { value: 'ip_transfer', label: 'IP Transfer', description: 'Intellectual property assets' },
  { value: 'real_estate', label: 'Real Estate', description: 'Property transactions' },
  { value: 'cross_border', label: 'Cross-Border', description: 'International transactions' },
  { value: 'micro_deals', label: 'Micro Deals', description: 'Small value collectibles & items' },
  { value: 'other', label: 'Other', description: 'Other deal types' }
];

export const DEAL_TYPES = [
  'Asset Sale',
  'Share Sale',
  'Business Sale',
  'Franchise Sale',
  'Other'
];

export const IP_ASSET_TYPES = [
  'Patent',
  'Trademark',
  'Copyright',
  'Trade Secret',
  'Domain Name',
  'Other'
];

export const PROPERTY_TYPES = [
  'Residential',
  'Commercial',
  'Industrial',
  'Land',
  'Other'
];

export const MICRO_DEAL_CONDITIONS = [
  'New',
  'Like New',
  'Good',
  'Fair',
  'Poor'
];

export const MICRO_DEAL_RARITIES = [
  'Common',
  'Uncommon', 
  'Rare',
  'Ultra Rare'
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
