
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
  currency: string; // Added currency field (ISO 4217)
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
  jurisdiction: string; // Added for ip_transfer and real_estate
  counterpartyCountry: string; // Added for cross_border
  buyerName?: string; // Optional at creation
  buyerEmail?: string; // Optional at creation
  
  // Documents
  uploadedDocuments: UploadedDocument[];
}

export interface IPAsset {
  type: 'patent' | 'trademark' | 'copyright' | 'trade_secret' | 'domain' | 'other';
  name: string;
  description: string;
  registrationNumber?: string;
  identifier?: string; // IP identifier (e.g., AU TM number, patent app no.)
  jurisdiction: string; // required
  transferType: 'assignment' | 'exclusive_license' | 'non_exclusive_license'; // required
  expiryDate?: string;
  value?: string;
}

export interface PropertyDetails {
  propertyType: 'residential' | 'commercial' | 'industrial' | 'land' | 'other';
  address: string; // required
  sqm?: number;
  zoning?: string; // optional
  council?: string;
  currentUse?: string;
  proposedUse?: string;
  settlementDate?: string; // optional
  contractConditions?: string[];
  stage: 'offer' | 'cooling_off' | 'finance' | 'building_pest' | 'exchange' | 'settlement'; // required enum
}

export interface CrossBorderDetails {
  buyerCountry: string;
  sellerCountry: string;
  counterpartyCountry: string; // required
  regulatoryApprovals: string[];
  taxImplications: string;
  currencyExchange: string;
  complianceRequirements: string[];
  incoterms?: string; // incoterms
  currency: 'AUD' | 'USD' | 'EUR'; // default AUD, allow USD/EUR
  regulatoryFlags?: string[]; // regulatory flags
}

export interface MicroDealDetails {
  itemName: string; // required
  itemType: string; // keep itemType for category
  condition: 'new' | 'used' | 'like_new' | 'good' | 'fair' | 'poor'; // item condition
  authenticity: 'verified' | 'unverified' | 'unknown';
  rarity: 'common' | 'uncommon' | 'rare' | 'ultra_rare';
  authenticityNotes?: string; // authenticity notes
  certifications?: string[];
  escrowOptIn: boolean; // escrow opt in (bool placeholder)
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
  documentContext?: {
    extractedText?: string;
    extractedData?: any;
  };
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
  { value: 'other', label: 'Deal Prompt', description: 'Other deal types' }
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

export const PROPERTY_STAGES = [
  'Offer',
  'Cooling Off', 
  'Finance',
  'Building & Pest',
  'Exchange',
  'Settlement'
];

export const INCOTERMS = [
  'EXW - Ex Works',
  'FCA - Free carrier',
  'CPT - Carriage paid to',
  'CIP - Carriage and insurance paid to',
  'DAP - Delivered at place',
  'DPU - Delivered at place unloaded',
  'DDP - Delivered duty paid',
  'FAS - Free alongside ship',
  'FOB - Free on board',
  'CFR - Cost and freight',
  'CIF - Cost, insurance and freight'
];

export const TRANSFER_TYPES = [
  'Assignment',
  'Exclusive License',
  'Non-Exclusive License'
];

export const CROSS_BORDER_CURRENCIES = [
  'AUD',
  'USD', 
  'EUR'
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
