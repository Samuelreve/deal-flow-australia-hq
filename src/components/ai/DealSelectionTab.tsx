
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DealSummary } from '@/hooks/useAIToolsContext'; 

interface DealSelectionTabProps {
  deals: DealSummary[];
  loadingDeals: boolean;
  selectedDealId: string;
  onDealSelect: (id: string) => void;
  aiLoading: boolean;
  onRunAI: () => void;
  activeOperation: string;
  activeTab: string;
  onNextTab: () => void;
}

const DealSelectionTab: React.FC<DealSelectionTabProps> = ({
  deals,
  loadingDeals,
  selectedDealId,
  onDealSelect,
  aiLoading,
  onRunAI,
  activeOperation,
  activeTab,
  onNextTab
}) => {
  // Determine if this is a document-specific operation
  const isDocumentOperation = ['summarize_document', 'explain_clause', 'summarize_contract', 'explain_contract_clause'].includes(activeOperation);
  
  // Determine button text based on operation
  const getButtonText = () => {
    if (activeOperation === 'summarize_deal') return 'Run AI Analysis';
    if (activeOperation === 'predict_deal_health') return 'Run AI Analysis';
    return '';
  };

  return (
    <TabsContent value="deals">
      <div className="space-y-4 py-2">
        <div>
          <Label htmlFor="deal">Select a deal</Label>
          <Select 
            value={selectedDealId} 
            onValueChange={(value) => onDealSelect(value)}
            disabled={loadingDeals || aiLoading}
          >
            <SelectTrigger id="deal">
              <SelectValue placeholder="Select deal..." />
            </SelectTrigger>
            <SelectContent>
              {deals.map((deal) => (
                <SelectItem key={deal.id} value={deal.id}>
                  {deal.title} ({deal.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loadingDeals && <p className="text-sm text-muted-foreground mt-2">Loading deals...</p>}
        </div>

        {activeTab === 'deals' && isDocumentOperation && (
          <Button 
            onClick={onNextTab}
            disabled={!selectedDealId}
          >
            Next: Select Document
          </Button>
        )}

        {(activeOperation === 'summarize_deal' || activeOperation === 'predict_deal_health') && (
          <Button 
            onClick={onRunAI}
            disabled={!selectedDealId || aiLoading}
          >
            {aiLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              getButtonText()
            )}
          </Button>
        )}
      </div>
    </TabsContent>
  );
};

export default DealSelectionTab;
