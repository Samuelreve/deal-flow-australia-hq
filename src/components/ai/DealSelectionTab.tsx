
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DealSummary } from '@/types/deal';

interface DealSelectionTabProps {
  deals: DealSummary[];
  selectedDealId: string | null;
  setSelectedDealId: (dealId: string) => void;
  loadingDeals: boolean;
  errorMessage: string | null;
  onRunAI: () => void;
  isLoading: boolean;
  activeOperation: string;
}

const DealSelectionTab: React.FC<DealSelectionTabProps> = ({
  deals,
  selectedDealId,
  setSelectedDealId,
  loadingDeals,
  errorMessage,
  onRunAI,
  isLoading,
  activeOperation
}) => {
  // Format operation specific button text
  const getOperationButtonText = () => {
    switch (activeOperation) {
      case 'summarize_deal':
        return 'Generate Deal Summary';
      case 'predict_deal_health':
        return 'Predict Deal Health';
      case 'deal_chat_query':
        return 'Ask Question';
      default:
        return 'Run Analysis';
    }
  };

  return (
    <TabsContent value="deals" className="flex flex-col space-y-4">
      {loadingDeals ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading deals...</span>
        </div>
      ) : errorMessage ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="mt-2 text-sm text-destructive">{errorMessage}</p>
        </div>
      ) : deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground">No deals found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create a deal first to use AI analysis tools.
          </p>
        </div>
      ) : (
        <>
          <Select
            value={selectedDealId || ""}
            onValueChange={setSelectedDealId}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a deal" />
            </SelectTrigger>
            <SelectContent>
              {deals.map((deal) => (
                <SelectItem key={deal.id} value={deal.id}>
                  {deal.title || deal.businessName || "Untitled Deal"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={onRunAI}
            disabled={!selectedDealId || isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getOperationButtonText()}
          </Button>
        </>
      )}
    </TabsContent>
  );
};

export default DealSelectionTab;
