
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Building2, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";

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
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return null;
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="mb-6 sm:mb-8">
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          {deal.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Badge variant={getStatusVariant(deal.status)} className="text-xs sm:text-sm">
            {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
          </Badge>
          {deal.deal_type && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span>{deal.deal_type}</span>
            </div>
          )}
          {deal.asking_price && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="font-medium">{formatPrice(deal.asking_price)}</span>
            </div>
          )}
          {deal.target_completion_date && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(deal.target_completion_date), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealDetailsHeader;
