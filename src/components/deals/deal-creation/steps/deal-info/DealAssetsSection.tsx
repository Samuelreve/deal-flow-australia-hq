
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { DealCreationData } from '../../types';

interface DealAssetsSectionProps {
  data: DealCreationData;
  updateData: (updates: Partial<DealCreationData>) => void;
  showAdvanced: boolean;
  onToggleAdvanced: (show: boolean) => void;
}

export const DealAssetsSection: React.FC<DealAssetsSectionProps> = ({
  data,
  updateData,
  showAdvanced,
  onToggleAdvanced
}) => {
  return (
    <Collapsible open={showAdvanced} onOpenChange={onToggleAdvanced}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between">
          Add asset details (optional)
          <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="keyAssetsIncluded">
              Key Assets Included
            </Label>
            <Textarea
              id="keyAssetsIncluded"
              value={data.keyAssetsIncluded}
              onChange={(e) => updateData({ keyAssetsIncluded: e.target.value })}
              placeholder="e.g., Equipment, Inventory, Customer List, Lease, Brand Name"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyAssetsExcluded">
              Assets Excluded
            </Label>
            <Textarea
              id="keyAssetsExcluded"
              value={data.keyAssetsExcluded}
              onChange={(e) => updateData({ keyAssetsExcluded: e.target.value })}
              placeholder="e.g., Personal vehicles, Specific equipment, Cash reserves"
              rows={4}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
