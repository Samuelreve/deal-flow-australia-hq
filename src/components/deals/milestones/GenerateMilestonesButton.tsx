
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGenerateMilestones } from "@/hooks/milestones/useGenerateMilestones";
import DealTypeSelectionForm from "./DealTypeSelectionForm";
import MilestoneReviewForm from "./MilestoneReviewForm";

interface GenerateMilestonesButtonProps {
  dealId: string;
  onMilestonesAdded: () => void;
  userRole?: string;
  className?: string;
}

const GenerateMilestonesButton: React.FC<GenerateMilestonesButtonProps> = ({ 
  dealId, 
  onMilestonesAdded,
  userRole = 'user',
  className
}) => {
  const {
    isDialogOpen,
    setIsDialogOpen,
    dealType,
    setDealType,
    generatedMilestones,
    isGenerating,
    isSaving,
    disclaimer,
    handleGenerateMilestones,
    handleGenerateWithoutModal,
    handleUpdateMilestone,
    handleToggleMilestone,
    handleSelectAll,
    handleSaveMilestones,
    handleBackToSelection,
    closeDialog
  } = useGenerateMilestones({ dealId, onMilestonesAdded });
  
  // Check if user role allows milestone generation
  const canGenerateMilestones = ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase());
  
  if (!canGenerateMilestones) {
    return null;
  }
  
  return (
    <>
      <Button 
        variant="outline" 
        onClick={handleGenerateWithoutModal}
        className={`gap-2 ${className || ''}`}
        size="sm"
        disabled={isGenerating}
      >
        <Sparkles className="h-4 w-4" />
        {isGenerating ? 'Generating...' : 'Generate Milestones'}
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Generated Milestones</DialogTitle>
          </DialogHeader>
          
          <MilestoneReviewForm 
            milestones={generatedMilestones}
            onToggleMilestone={handleToggleMilestone}
            onSelectAll={handleSelectAll}
            onUpdateMilestone={handleUpdateMilestone}
            onSave={handleSaveMilestones}
            onBack={handleBackToSelection}
            isSaving={isSaving}
            disclaimer={disclaimer}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GenerateMilestonesButton;
