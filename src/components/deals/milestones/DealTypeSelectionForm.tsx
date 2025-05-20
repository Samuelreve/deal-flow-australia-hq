
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";

export const DEAL_TYPES = [
  { value: 'Asset Sale', label: 'Asset Sale' },
  { value: 'Share Sale', label: 'Share Sale' },
  { value: 'Commercial Property', label: 'Commercial Property' },
  { value: 'Merger', label: 'Merger' },
  { value: 'Joint Venture', label: 'Joint Venture' },
];

interface DealTypeSelectionFormProps {
  dealType: string;
  setDealType: (dealType: string) => void;
  onGenerate: () => void;
  onClose: () => void;
  isGenerating: boolean;
}

const DealTypeSelectionForm: React.FC<DealTypeSelectionFormProps> = ({
  dealType,
  setDealType,
  onGenerate,
  onClose,
  isGenerating
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="deal-type">Deal Type</Label>
        <Select 
          value={dealType} 
          onValueChange={setDealType}
        >
          <SelectTrigger id="deal-type">
            <SelectValue placeholder="Select deal type" />
          </SelectTrigger>
          <SelectContent>
            {DEAL_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onGenerate} 
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            'Generate Milestones'
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default DealTypeSelectionForm;
