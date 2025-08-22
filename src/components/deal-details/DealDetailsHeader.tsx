
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

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{deal.title}</h1>
          <div className="flex items-center gap-4 mb-4">
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
          {deal.description && (
            <div className="text-muted-foreground max-w-4xl">
              <p className="text-justify leading-relaxed whitespace-pre-wrap">
                {deal.description}
              </p>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-1">Health Score</div>
          <div className="text-2xl font-bold">{deal.health_score}/100</div>
        </div>
      </div>
    </div>
  );
};

export default DealDetailsHeader;
