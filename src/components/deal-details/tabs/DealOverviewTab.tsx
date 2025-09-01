import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Calendar, DollarSign, User, FileText, Tags, Copyright, Home, Globe, Star } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import { DEAL_CATEGORIES } from "@/components/deals/deal-creation/types";

interface Deal {
  id: string;
  title: string;
  description?: string;
  status: string;
  health_score: number;
  seller_id: string;
  buyer_id?: string;
  asking_price?: number;
  deal_type?: string;
  deal_category?: string;
  business_legal_name?: string;
  business_trading_names?: string;
  business_abn?: string;
  business_acn?: string;
  business_industry?: string;
  business_years_in_operation?: number;
  business_registered_address?: string;
  business_principal_place_address?: string;
  reason_for_selling?: string;
  primary_seller_contact_name?: string;
  target_completion_date?: string;
  ip_assets?: any;
  property_details?: any;
  cross_border_details?: any;
  micro_deal_details?: any;
  created_at: string;
  updated_at: string;
}

interface DealOverviewTabProps {
  deal: Deal;
}

const DealOverviewTab: React.FC<DealOverviewTabProps> = ({ deal }) => {
  const formatPrice = (price?: number) => {
    if (!price) return 'Not specified';
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryLabel = (categoryValue?: string) => {
    if (!categoryValue) return 'Not specified';
    const category = DEAL_CATEGORIES.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const getCategoryIcon = (categoryValue?: string) => {
    const iconMap = {
      'ip_transfer': Copyright,
      'real_estate': Home,
      'cross_border': Globe,
      'micro_deals': Star,
      'business_sale': Building
    };
    return iconMap[categoryValue as keyof typeof iconMap] || Tags;
  };

  const getDescriptionSummary = (description?: string) => {
    if (!description) return 'No description available';
    
    // Split by sentences and take first two
    const sentences = description.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '');
  };

  return (
    <div className="space-y-6">
      {/* Deal Description */}
      {deal.description && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">{deal.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {getDescriptionSummary(deal.description)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Fundamentals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Deal Fundamentals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {deal.deal_category && (
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                {React.createElement(getCategoryIcon(deal.deal_category), { className: "h-3 w-3" })}
                {getCategoryLabel(deal.deal_category)}
              </Badge>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Deal Type</p>
              <p className="font-medium">{deal.deal_type || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Asking Price</p>
              <p className="font-medium">{formatPrice(deal.asking_price)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Target Completion</p>
              <p className="font-medium">{formatDate(deal.target_completion_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Reason for Selling</p>
              <p className="font-medium">{deal.reason_for_selling || 'Not specified'}</p>
            </div>
          </div>

          {/* Category-specific Deal Information */}
          {deal.deal_category === 'real_estate' && deal.property_details && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Home className="h-4 w-4" />
                Property Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Property Type</p>
                  <p className="font-medium">{deal.property_details.propertyType || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Size (sqm)</p>
                  <p className="font-medium">{deal.property_details.size || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Bedrooms</p>
                  <p className="font-medium">{deal.property_details.bedrooms || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Bathrooms</p>
                  <p className="font-medium">{deal.property_details.bathrooms || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}

          {deal.deal_category === 'ip_transfer' && deal.ip_assets && deal.ip_assets.assets && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Copyright className="h-4 w-4" />
                IP Assets ({deal.ip_assets.assets.length})
              </h4>
              <div className="space-y-3">
                {deal.ip_assets.assets.slice(0, 2).map((asset: any, index: number) => (
                  <div key={index} className="border rounded p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Asset Name</p>
                        <p className="font-medium text-sm">{asset.name || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
                        <p className="font-medium text-sm">{asset.type || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {deal.ip_assets.assets.length > 2 && (
                  <p className="text-sm text-muted-foreground">+{deal.ip_assets.assets.length - 2} more assets</p>
                )}
              </div>
            </div>
          )}

          {deal.deal_category === 'cross_border' && deal.cross_border_details && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Cross-Border Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Origin Country</p>
                  <p className="font-medium">{deal.cross_border_details.originCountry || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Target Country</p>
                  <p className="font-medium">{deal.cross_border_details.targetCountry || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Currency</p>
                  <p className="font-medium">{deal.cross_border_details.currency || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Exchange Rate</p>
                  <p className="font-medium">{deal.cross_border_details.exchangeRate || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}

          {deal.deal_category === 'micro_deals' && deal.micro_deal_details && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Item Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Item Name</p>
                  <p className="font-medium">{deal.micro_deal_details.itemName || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
                  <p className="font-medium">{deal.micro_deal_details.category || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Condition</p>
                  <p className="font-medium">{deal.micro_deal_details.condition || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Rarity</p>
                  <p className="font-medium">{deal.micro_deal_details.rarity || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Information - Show for all categories if business info exists */}
      {(deal.deal_category === 'business_sale' || !deal.deal_category || 
        (deal.business_legal_name || deal.business_trading_names || deal.business_abn || deal.business_acn || deal.business_industry)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Legal Name</p>
              <p className="font-medium">{deal.business_legal_name || 'Not specified'}</p>
            </div>
            
            {deal.business_trading_names && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Trading Names</p>
                <p className="font-medium">{deal.business_trading_names}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">ABN</p>
                <p className="font-medium">{deal.business_abn || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">ACN</p>
                <p className="font-medium">{deal.business_acn || 'Not specified'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Industry</p>
                <p className="font-medium">{deal.business_industry || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Years in Operation</p>
                <p className="font-medium">{deal.business_years_in_operation || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Combined Property Address & Additional Details for Real Estate */}
      {deal.deal_category === 'real_estate' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Property Address</p>
              <p className="font-medium">{deal.property_details?.address || 'Not specified'}</p>
            </div>
            
            {/* Additional Property Details */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Home className="h-4 w-4" />
                Additional Property Details
              </h4>
              <div className="space-y-3">
                {deal.property_details?.zoning && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Zoning</p>
                    <p className="font-medium">{deal.property_details.zoning}</p>
                  </div>
                )}
                {deal.property_details?.landSize && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Land Size (sqm)</p>
                    <p className="font-medium">{deal.property_details.landSize}</p>
                  </div>
                )}
                {deal.property_details?.parking && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Parking</p>
                    <p className="font-medium">{deal.property_details.parking}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address Information for Non-Real Estate deals */}
      {(deal.deal_category === 'business_sale' || (!deal.deal_category && (deal.business_registered_address || deal.business_principal_place_address))) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Addresses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Registered Address</p>
              <p className="font-medium">{deal.business_registered_address || 'Not specified'}</p>
            </div>
            
            {deal.business_principal_place_address && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Principal Place of Business</p>
                <p className="font-medium">{deal.business_principal_place_address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Seller Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Seller Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Primary Contact</p>
            <p className="font-medium">{deal.primary_seller_contact_name || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Deal Created</p>
            <p className="font-medium">{formatDate(deal.created_at)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
            <p className="font-medium">{formatDate(deal.updated_at)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Category-specific Information Cards */}

      {deal.deal_category === 'cross_border' && deal.cross_border_details && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Regulatory & Tax Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deal.cross_border_details.regulatoryRequirements && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Regulatory Requirements</p>
                <p className="font-medium">{deal.cross_border_details.regulatoryRequirements}</p>
              </div>
            )}
            {deal.cross_border_details.taxImplications && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Tax Implications</p>
                <p className="font-medium">{deal.cross_border_details.taxImplications}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {deal.deal_category === 'micro_deals' && deal.micro_deal_details && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Item Authentication & Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deal.micro_deal_details.year && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Year</p>
                <p className="font-medium">{deal.micro_deal_details.year}</p>
              </div>
            )}
            {deal.micro_deal_details.authentication && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Authentication</p>
                <p className="font-medium">{deal.micro_deal_details.authentication}</p>
              </div>
            )}
            {deal.micro_deal_details.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                <p className="font-medium">{deal.micro_deal_details.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {deal.deal_category === 'ip_transfer' && deal.ip_assets && deal.ip_assets.assets && deal.ip_assets.assets.length > 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copyright className="h-5 w-5" />
              Additional IP Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deal.ip_assets.assets.slice(2).map((asset: any, index: number) => (
              <div key={index + 2} className="border rounded p-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Asset Name</p>
                    <p className="font-medium">{asset.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
                    <p className="font-medium">{asset.type || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Registration Number</p>
                    <p className="font-medium">{asset.registrationNumber || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Expiry Date</p>
                    <p className="font-medium">{asset.expiryDate ? formatDate(asset.expiryDate) : 'Not specified'}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
};

export default DealOverviewTab;