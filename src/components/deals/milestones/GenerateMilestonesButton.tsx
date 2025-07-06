
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
        onClick={() => setIsDialogOpen(true)}
        className={`gap-2 ${className || ''}`}
        size="sm"
      >
        <Sparkles className="h-4 w-4" />
        Generate Milestones
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Deal Milestones</DialogTitle>
          </DialogHeader>
          
          {!generatedMilestones.length ? (
              <DealTypeSelectionForm 
                dealType={dealType}
                setDealType={setDealType}
                onGenerate={() => {
                  console.log('🎯 Generate button clicked!');
                  handleGenerateMilestones();
                }}
                onClose={closeDialog}
                isGenerating={isGenerating}
              />
          ) : (
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GenerateMilestonesButton;
