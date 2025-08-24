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
      
      // Auto-generate AI title and description using document content
      if (data.text && mappedData.businessTradingName) {
        try {
          console.log('🤖 Generating AI-powered title and description...');
          
          // Generate AI title
          const titleResponse = await supabase.functions.invoke('ai-document-suggestion', {
            body: {
              documentText: data.text,
              extractedData: data.extractedData,
              fieldType: 'title',
              currentValue: mappedData.dealTitle || '',
              dealCategory: options.dealCategory
            }
          });

          if (titleResponse.data?.suggestion) {
            mappedData.dealTitle = titleResponse.data.suggestion;
            console.log('✅ AI title generated:', titleResponse.data.suggestion);
          }

          // Generate AI description
          const descriptionResponse = await supabase.functions.invoke('ai-document-suggestion', {
            body: {
              documentText: data.text,
              extractedData: data.extractedData,
              fieldType: 'description',
              currentValue: mappedData.dealDescription || '',
              dealCategory: options.dealCategory
            }
          });

          if (descriptionResponse.data?.suggestion) {
            mappedData.dealDescription = descriptionResponse.data.suggestion;
            console.log('✅ AI description generated');
          }
        } catch (aiError) {
          console.error('❌ Error generating AI suggestions:', aiError);
          // Continue with extracted data even if AI suggestions fail
        }
      }
      
      if (options.onDataExtracted && Object.keys(mappedData).length > 0) {
        options.onDataExtracted(mappedData);
        toast({
          title: "Data Extracted Successfully", 
          description: `Automatically extracted and generated AI content from ${fileName}`,
        });
      }

      console.log('✅ Auto-extraction completed successfully');

      return {
        success: true,
        text: data.text,
        extractedData: mappedData // Return the mapped data instead of raw data
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

    // Auto-generate deal title based on extracted data
    if (extractedData.businessInfo?.businessName || extractedData.propertyDetails?.address || extractedData.microDealInfo?.itemName) {
      let title = '';
      switch (category) {
        case 'business_sale':
          title = `Sale of ${extractedData.businessInfo?.businessName || 'Business'} - Business Sale`;
          break;
        case 'real_estate':
          title = `Property Sale - ${extractedData.propertyDetails?.address || 'Property'}`;
          break;
        case 'ip_transfer':
          const ipAsset = extractedData.ipAssets?.[0];
          title = `IP Transfer - ${ipAsset?.name || 'Intellectual Property'}`;
          break;
        case 'cross_border':
          title = `Cross-Border Transaction - ${extractedData.businessInfo?.businessName || 'International Deal'}`;
          break;
        case 'micro_deals':
          title = `Sale of ${extractedData.microDealInfo?.itemName || 'Collectible Item'}`;
          break;
      }
      if (title) mappedData.dealTitle = title;
    }

    // Auto-generate deal description based on extracted data
    let description = '';
    switch (category) {
      case 'business_sale':
        if (extractedData.businessInfo) {
          const b = extractedData.businessInfo;
          description = `${b.businessName ? `${b.businessName} is ` : ''}${b.industry ? `a ${b.industry} business ` : ''}${b.yearsInOperation ? `with ${b.yearsInOperation} years of operation` : ''}. ${b.assetsIncluded ? `Key assets include: ${b.assetsIncluded}` : ''}`;
        }
        break;
      case 'real_estate':
        if (extractedData.propertyDetails) {
          const p = extractedData.propertyDetails;
          description = `${p.propertyType ? `${p.propertyType.charAt(0).toUpperCase() + p.propertyType.slice(1)} property ` : 'Property '}located at ${p.address || 'prime location'}${p.sqm ? ` with ${p.sqm} sqm` : ''}${p.zoning ? ` in ${p.zoning} zoning` : ''}.`;
        }
        break;
      case 'ip_transfer':
        if (extractedData.ipAssets?.[0]) {
          const ip = extractedData.ipAssets[0];
          description = `${ip.type ? `${ip.type.charAt(0).toUpperCase() + ip.type.slice(1)} ` : ''}${ip.name ? `"${ip.name}"` : 'intellectual property'} ${ip.registrationNumber ? `(Registration: ${ip.registrationNumber})` : ''}${ip.jurisdiction ? ` registered in ${ip.jurisdiction}` : ''}.`;
        }
        break;
      case 'micro_deals':
        if (extractedData.microDealInfo) {
          const m = extractedData.microDealInfo;
          description = `${m.itemName || 'Collectible item'}${m.condition ? ` in ${m.condition} condition` : ''}${m.rarity ? ` (${m.rarity} rarity)` : ''}${m.authenticity === 'verified' ? ' - Authenticity verified' : ''}.`;
        }
        break;
    }
    if (description.trim()) mappedData.dealDescription = description.trim();

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

    // Set deal type based on category
    switch (category) {
      case 'business_sale':
        mappedData.dealType = 'Asset Sale';
        break;
      case 'ip_transfer':
        mappedData.dealType = 'IP Assignment';
        break;
      case 'real_estate':
        mappedData.dealType = 'Property Sale';
        break;
      case 'cross_border':
        mappedData.dealType = 'Cross-Border Transaction';
        break;
      case 'micro_deals':
        mappedData.dealType = 'Item Sale';
        break;
    }

    // Map reason for selling based on extracted information
    if (category === 'business_sale' && extractedData.businessInfo) {
      mappedData.reasonForSelling = 'Business Expansion';
    } else if (category === 'real_estate') {
      mappedData.reasonForSelling = 'Investment';
    } else if (category === 'micro_deals') {
      mappedData.reasonForSelling = 'Personal Collection';
    }

    // Map category-specific data
    switch (category) {
      case 'business_sale':
        // Business sale specific fields are already mapped above
        break;

      case 'ip_transfer':
        if (extractedData.ipAssets && Array.isArray(extractedData.ipAssets)) {
          mappedData.ipAssets = extractedData.ipAssets.map((asset: any) => ({
            type: asset.type?.toLowerCase().replace(' ', '_') || 'patent',
            name: asset.name || '',
            description: asset.description || `${asset.type || 'IP Asset'} - ${asset.name || 'Untitled'}${asset.registrationNumber ? ` (${asset.registrationNumber})` : ''}`,
            registrationNumber: asset.registrationNumber || '',
            identifier: asset.registrationNumber || asset.applicationNumber || '',
            jurisdiction: asset.jurisdiction || '',
            transferType: asset.transferType?.toLowerCase().replace(' ', '_') || 'assignment',
            expiryDate: asset.expiryDate || '',
            value: asset.value || asset.estimatedValue || ''
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