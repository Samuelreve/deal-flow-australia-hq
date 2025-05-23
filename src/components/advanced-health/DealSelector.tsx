
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Deal } from "@/types/deal";

interface DealSelectorProps {
  deals: Deal[];
  selectedDealId: string;
  onSelectionChange: (dealId: string) => void;
}

const DealSelector: React.FC<DealSelectorProps> = ({
  deals,
  selectedDealId,
  onSelectionChange
}) => {
  return (
    <div className="mb-6">
      <Label>Focus on Specific Deal (Optional)</Label>
      <Select value={selectedDealId} onValueChange={onSelectionChange}>
        <SelectTrigger className="w-full max-w-md">
          <SelectValue placeholder="All deals or select specific deal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Deals</SelectItem>
          {deals.filter(d => d.status === 'active').map(deal => (
            <SelectItem key={deal.id} value={deal.id}>
              {deal.title} ({deal.healthScore}%)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DealSelector;
