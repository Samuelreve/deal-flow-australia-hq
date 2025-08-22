
import React from "react";
import { Badge } from "@/components/ui/badge";

interface Deal {
  id: string;
  title: string;
  description?: string;
  status: string;
  health_score: number;
  deal_type?: string;
  asking_price?: number;
  target_completion_date?: string;
  created_at: string;
  updated_at: string;
}

interface DealDetailsHeaderProps {
  deal: Deal;
}

const DealDetailsHeader: React.FC<DealDetailsHeaderProps> = ({ deal }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Not specified';
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Clean up title to remove placeholder text
  const cleanTitle = (title: string): string => {
    return title
      .replace(/\[([^\]]+)\]/g, '') // Remove content in brackets like [Property Address]
      .replace(/\{([^}]+)\}/g, '') // Remove content in braces like {propertyAddress}  
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s*-\s*$/, '') // Remove trailing dash
      .replace(/^\s*-\s*/, '') // Remove leading dash
      .trim();
  };

  // Clean up description to remove placeholder text
  const cleanDescription = (description: string): string => {
    return description
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove markdown bold formatting
      .replace(/\[([^\]]+)\]/g, '') // Remove content in brackets
      .replace(/\{([^}]+)\}/g, '') // Remove content in braces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  };

  const displayTitle = cleanTitle(deal.title);
  const displayDescription = deal.description ? cleanDescription(deal.description) : '';

  return (
    <div className="mb-8 border-b border-border pb-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-foreground mb-3 leading-tight break-words">
            {displayTitle || 'Untitled Deal'}
          </h1>
          <div className="flex items-center flex-wrap gap-4 mb-4">
            <Badge className={getStatusColor(deal.status)}>
              {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
            </Badge>
            {deal.deal_type && (
              <span className="text-sm text-muted-foreground">
                <strong>Type:</strong> {deal.deal_type}
              </span>
            )}
            {deal.asking_price && (
              <span className="text-sm text-muted-foreground">
                <strong>Price:</strong> {formatPrice(deal.asking_price)}
              </span>
            )}
          </div>
          {displayDescription && (
            <p className="text-muted-foreground max-w-4xl leading-relaxed">
              {displayDescription}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm text-muted-foreground mb-1">Health Score</div>
          <div className="text-3xl font-bold text-foreground">{deal.health_score}/100</div>
        </div>
      </div>
    </div>
  );
};

export default DealDetailsHeader;
