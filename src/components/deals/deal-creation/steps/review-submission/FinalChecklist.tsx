
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface ChecklistState {
  reviewedDetails: boolean;
  uploadedDocs: boolean;
  readyToCreate: boolean;
}

interface FinalChecklistProps {
  checklist: ChecklistState;
  onChecklistChange: (key: keyof ChecklistState) => void;
}

export const FinalChecklist: React.FC<FinalChecklistProps> = ({ checklist, onChecklistChange }) => {
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
      </CardContent>
    </Card>
  );
};
