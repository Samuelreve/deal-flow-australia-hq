
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ChecklistState {
  reviewedDetails: boolean;
  uploadedDocs: boolean;
  readyToCreate: boolean;
  autoGenerateContract: boolean;
}

interface FinalChecklistProps {
  checklist: ChecklistState;
  onChecklistChange: (key: keyof ChecklistState) => void;
  onSwitchChange: (key: keyof ChecklistState, value: boolean) => void;
}

export const FinalChecklist: React.FC<FinalChecklistProps> = ({ 
  checklist, 
  onChecklistChange, 
  onSwitchChange 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Final Checklist</CardTitle>
        <CardDescription>
          Please confirm the following before creating your deal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="reviewed"
            checked={checklist.reviewedDetails}
            onCheckedChange={() => onChecklistChange('reviewedDetails')}
          />
          <label 
            htmlFor="reviewed" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I have reviewed my business and deal details
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="uploaded"
            checked={checklist.uploadedDocs}
            onCheckedChange={() => onChecklistChange('uploadedDocs')}
          />
          <label 
            htmlFor="uploaded" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I have uploaded the required documents
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="ready"
            checked={checklist.readyToCreate}
            onCheckedChange={() => onChecklistChange('readyToCreate')}
          />
          <label 
            htmlFor="ready" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I'm ready to create this deal
          </label>
        </div>

        {/* Automated Contract Generation Switch */}
        <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-muted/20">
          <div className="flex-1">
            <Label htmlFor="auto-contract" className="text-sm font-medium">
              Generate contract automatically
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              AI will generate a contract document after deal creation using your business details and uploaded documents
            </p>
          </div>
          <Switch
            id="auto-contract"
            checked={checklist.autoGenerateContract}
            onCheckedChange={(value) => onSwitchChange('autoGenerateContract', value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
