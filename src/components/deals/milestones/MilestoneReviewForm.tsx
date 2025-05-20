
import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";

export interface MilestoneItem {
  name: string;
  description: string;
  order: number;
  selected: boolean;
}

interface MilestoneReviewFormProps {
  milestones: MilestoneItem[];
  onToggleMilestone: (index: number) => void;
  onSelectAll: (selected: boolean) => void;
  onSave: () => void;
  onBack: () => void;
  isSaving: boolean;
  disclaimer: string;
}

const MilestoneReviewForm: React.FC<MilestoneReviewFormProps> = ({
  milestones,
  onToggleMilestone,
  onSelectAll,
  onSave,
  onBack,
  isSaving,
  disclaimer
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Generated Milestones</h3>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onSelectAll(true)}
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onSelectAll(false)}
          >
            Deselect All
          </Button>
        </div>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto pr-2">
        {milestones.map((milestone, index) => (
          <div key={index} className="flex items-start space-x-3 py-3 border-b last:border-0">
            <Checkbox 
              checked={milestone.selected}
              onCheckedChange={() => onToggleMilestone(index)}
              id={`milestone-${index}`}
              className="mt-1"
            />
            <div>
              <Label 
                htmlFor={`milestone-${index}`}
                className="font-medium text-sm cursor-pointer"
              >
                {milestone.name}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {disclaimer && (
        <p className="text-xs text-muted-foreground italic">{disclaimer}</p>
      )}
      
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={onBack}
          disabled={isSaving}
        >
          Back
        </Button>
        <Button 
          onClick={onSave}
          disabled={isSaving || milestones.filter(m => m.selected).length === 0}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            'Add to Deal'
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default MilestoneReviewForm;
