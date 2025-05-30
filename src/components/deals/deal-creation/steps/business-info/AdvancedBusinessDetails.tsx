
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { DealCreationData } from '../../types';

interface AdvancedBusinessDetailsProps {
  data: DealCreationData;
  showAdvanced: boolean;
  onToggleAdvanced: (show: boolean) => void;
  onUpdateData: (updates: Partial<DealCreationData>) => void;
}

export const AdvancedBusinessDetails: React.FC<AdvancedBusinessDetailsProps> = ({
  data,
  showAdvanced,
  onToggleAdvanced,
  onUpdateData
}) => {
  return (
    <Collapsible open={showAdvanced} onOpenChange={onToggleAdvanced}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between">
          Add more details (optional)
          <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="principalAddress">
            Principal Place of Business (if different from registered address)
          </Label>
          <Textarea
            id="principalAddress"
            value={data.principalAddress}
            onChange={(e) => onUpdateData({ principalAddress: e.target.value })}
            placeholder="789 Trading Street, City, State, Postcode"
            rows={2}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
