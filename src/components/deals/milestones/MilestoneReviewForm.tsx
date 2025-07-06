
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit3, Save, X } from "lucide-react";
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
  onUpdateMilestone: (index: number, name: string, description: string) => void;
  onSave: () => void;
  onBack: () => void;
  isSaving: boolean;
  disclaimer: string;
}

const MilestoneReviewForm: React.FC<MilestoneReviewFormProps> = ({
  milestones,
  onToggleMilestone,
  onSelectAll,
  onUpdateMilestone,
  onSave,
  onBack,
  isSaving,
  disclaimer
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({
      name: milestones[index].name,
      description: milestones[index].description
    });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      onUpdateMilestone(editingIndex, editForm.name, editForm.description);
      setEditingIndex(null);
      setEditForm({ name: '', description: '' });
    }
  };

  const handleDiscardEdit = () => {
    setEditingIndex(null);
    setEditForm({ name: '', description: '' });
  };

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
            <div className="flex-1">
              {editingIndex === index ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`edit-name-${index}`} className="text-sm font-medium">
                      Title
                    </Label>
                    <Input
                      id={`edit-name-${index}`}
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                      placeholder="Milestone title"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-description-${index}`} className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      id={`edit-description-${index}`}
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1"
                      placeholder="Milestone description"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={!editForm.name.trim()}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDiscardEdit}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Discard
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Label 
                      htmlFor={`milestone-${index}`}
                      className="font-medium text-sm cursor-pointer"
                    >
                      {milestone.name}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStartEdit(index)}
                    className="ml-2 h-8 w-8 p-0"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
              )}
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
