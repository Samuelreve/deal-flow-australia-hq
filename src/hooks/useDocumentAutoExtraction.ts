import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DealCreationData } from '@/components/deals/deal-creation/types';
import { useToast } from '@/components/ui/use-toast';

interface ExtractionResult {
  success: boolean;
  text?: string;
  extractedData?: any;
  error?: string;
}

interface AutoExtractOptions {
  dealCategory: string;
  onDataExtracted?: (extractedData: Partial<DealCreationData>) => void;
}

export const useDocumentAutoExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const extractDataFromDocument = async (
    fileBase64: string,
    fileName: string,
    mimeType: string,
    options: AutoExtractOptions
  ): Promise<ExtractionResult> => {
    setIsExtracting(true);

    try {
      console.log(`🔍 Starting auto-extraction for ${fileName} (Category: ${options.dealCategory})`);

      const { data, error } = await supabase.functions.invoke('enhanced-document-extractor', {
        body: {
          fileBase64,
          fileName,
          mimeType,
          dealCategory: options.dealCategory
        }
      });

      if (error) {
        throw new Error(error.message || 'Auto-extraction failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Extraction unsuccessful');
      }

      // Map extracted data to form data structure
      const mappedData = mapExtractedDataToFormData(data.extractedData, options.dealCategory);
      
      if (options.onDataExtracted && Object.keys(mappedData).length > 0) {
        options.onDataExtracted(mappedData);
        toast({
          title: "Data Extracted Successfully",
          description: `Automatically extracted information from ${fileName}`,
        });
      }

      console.log('✅ Auto-extraction completed successfully');

      return {
        success: true,
        text: data.text,
        extractedData: data.extractedData
      };

    } catch (error: any) {
      console.error('❌ Auto-extraction failed:', error);
      
      toast({
        title: "Auto-extraction Failed",
        description: error.message || "Failed to extract data from document",
        variant: "destructive"
      });

      return {
        success: false,
        error: error.message || 'Auto-extraction failed'
      };
    } finally {
      setIsExtracting(false);
    }
  };

  const mapExtractedDataToFormData = (extractedData: any, category: string): Partial<DealCreationData> => {
    if (!extractedData) return {};

    const mappedData: Partial<DealCreationData> = {};

    // Map common business information
    if (extractedData.businessInfo) {
      const business = extractedData.businessInfo;
      if (business.businessName) mappedData.businessTradingName = business.businessName;
      if (business.legalName) mappedData.businessLegalName = business.legalName;
      if (business.abn) mappedData.abn = business.abn;
      if (business.acn) mappedData.acn = business.acn;
      if (business.industry) mappedData.businessIndustry = business.industry;
      if (business.yearsInOperation) mappedData.yearsInOperation = business.yearsInOperation;
      if (business.address) mappedData.registeredAddress = business.address;
      if (business.assetsIncluded) mappedData.keyAssetsIncluded = business.assetsIncluded;
      if (business.liabilitiesIncluded) mappedData.keyAssetsExcluded = business.liabilitiesIncluded;
    }

    // Map seller and legal information
    if (extractedData.sellerInfo) {
      const seller = extractedData.sellerInfo;
      if (seller.primarySellerName) mappedData.primarySellerName = seller.primarySellerName;
      if (seller.sellerEntityType) mappedData.sellerEntityType = seller.sellerEntityType;
      if (seller.legalRepName) mappedData.legalRepName = seller.legalRepName;
      if (seller.legalRepEmail) mappedData.legalRepEmail = seller.legalRepEmail;
      if (seller.legalRepPhone) mappedData.legalRepPhone = seller.legalRepPhone;
      if (seller.jurisdiction) mappedData.jurisdiction = seller.jurisdiction;
      if (seller.counterpartyCountry) mappedData.counterpartyCountry = seller.counterpartyCountry;
      if (seller.buyerName) mappedData.buyerName = seller.buyerName;
      if (seller.buyerEmail) mappedData.buyerEmail = seller.buyerEmail;
    }

    // Map financial information
    if (extractedData.financialInfo?.askingPrice) {
      mappedData.askingPrice = extractedData.financialInfo.askingPrice;
    }

    // Map category-specific data
    switch (category) {
      case 'business_sale':
        // Business sale specific fields are already mapped above
        break;

      case 'ip_transfer':
        if (extractedData.ipAssets && Array.isArray(extractedData.ipAssets)) {
          mappedData.ipAssets = extractedData.ipAssets.map((asset: any) => ({
            type: asset.type?.toLowerCase().replace(' ', '_') || 'other',
            name: asset.name || '',
            description: '',
            registrationNumber: asset.registrationNumber || '',
            expiryDate: asset.expiryDate || '',
            value: '',
            jurisdiction: asset.jurisdiction || '',
            transferType: asset.transferType?.toLowerCase().replace(' ', '_') || 'assignment'
          }));
        }
        break;

      case 'real_estate':
        if (extractedData.propertyDetails) {
          const property = extractedData.propertyDetails;
          mappedData.propertyDetails = {
            propertyType: property.propertyType?.toLowerCase() || 'residential',
            address: property.address || '',
            sqm: property.sqm || undefined,
            zoning: property.zoning || '',
            council: property.council || '',
            currentUse: '',
            proposedUse: '',
            settlementDate: property.settlementDate || '',
            contractConditions: [],
            stage: (property.stage?.toLowerCase().replace(' ', '_') as any) || 'offer'
          };
        }
        break;

      case 'cross_border':
        if (extractedData.crossBorderInfo) {
          const crossBorder = extractedData.crossBorderInfo;
          mappedData.crossBorderDetails = {
            buyerCountry: crossBorder.buyerCountry || '',
            sellerCountry: crossBorder.sellerCountry || '',
            counterpartyCountry: crossBorder.counterpartyCountry || '',
            regulatoryApprovals: crossBorder.regulatoryRequirements || [],
            taxImplications: '',
            currencyExchange: '',
            complianceRequirements: [],
            incoterms: crossBorder.incoterms || '',
            currency: crossBorder.currency || 'AUD',
            regulatoryFlags: crossBorder.regulatoryFlags || []
          };
        }
        break;

      case 'micro_deals':
        if (extractedData.microDealInfo) {
          const microDeal = extractedData.microDealInfo;
          mappedData.microDealDetails = {
            itemName: microDeal.itemName || '',
            itemType: microDeal.itemType || '',
            condition: microDeal.condition?.toLowerCase().replace(' ', '_') || 'new',
            authenticity: microDeal.authenticity?.toLowerCase() || 'unknown',
            rarity: microDeal.rarity?.toLowerCase().replace(' ', '_') || 'common',
            authenticityNotes: microDeal.authenticityNotes || '',
            certifications: [],
            escrowOptIn: microDeal.escrowOptIn || false
          };
        }
        break;
    }

    return mappedData;
  };

  return {
    extractDataFromDocument,
    isExtracting
  };
};