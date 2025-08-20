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
    }

    // Map financial information
    if (extractedData.financialInfo?.askingPrice) {
      mappedData.askingPrice = extractedData.financialInfo.askingPrice;
    }

    // Map category-specific data
    switch (category) {
      case 'ip_transfer':
        if (extractedData.ipAssets && Array.isArray(extractedData.ipAssets)) {
          mappedData.ipAssets = extractedData.ipAssets.map((asset: any) => ({
            type: asset.type?.toLowerCase().replace(' ', '_') || 'other',
            name: asset.name || '',
            description: asset.description || '',
            registrationNumber: asset.registrationNumber || '',
            expiryDate: asset.expiryDate || '',
            value: ''
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
            settlementDate: '',
            contractConditions: []
          };
        }
        break;

      case 'cross_border':
        if (extractedData.crossBorderInfo) {
          const crossBorder = extractedData.crossBorderInfo;
          mappedData.crossBorderDetails = {
            buyerCountry: crossBorder.buyerCountry || '',
            sellerCountry: crossBorder.sellerCountry || '',
            regulatoryApprovals: crossBorder.regulatoryRequirements || [],
            taxImplications: '',
            currencyExchange: '',
            complianceRequirements: []
          };
        }
        break;

      case 'micro_deals':
        if (extractedData.microDealInfo) {
          const microDeal = extractedData.microDealInfo;
          mappedData.microDealDetails = {
            itemType: microDeal.itemType || '',
            itemName: microDeal.itemName || '',
            condition: microDeal.condition?.toLowerCase().replace(' ', '_') || 'new',
            authenticity: microDeal.authenticity?.toLowerCase() || 'unknown',
            rarity: microDeal.rarity?.toLowerCase().replace(' ', '_') || 'common',
            authenticityNotes: '',
            certifications: []
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