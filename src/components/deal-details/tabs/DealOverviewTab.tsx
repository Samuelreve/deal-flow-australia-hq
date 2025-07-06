import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Calendar, DollarSign, User, FileText } from "lucide-react";

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
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
        </CardContent>
      </Card>

      {/* Business Information */}
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

      {/* Addresses */}
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
    </div>
  );
};

export default DealOverviewTab;