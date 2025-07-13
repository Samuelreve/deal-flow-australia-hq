
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useDocumentAI } from "@/hooks/document-ai/useDocumentAI";
import { supabase } from "@/integrations/supabase/client";
import { MilestoneStatus } from "@/types/deal";
import { MilestoneGenerationResponse } from "@/hooks/document-ai/types";
import { MilestoneItem } from '@/components/deals/milestones/MilestoneReviewForm';

interface UseGenerateMilestonesProps {
  dealId: string;
  onMilestonesAdded: () => void;
}

export const useGenerateMilestones = ({ dealId, onMilestonesAdded }: UseGenerateMilestonesProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dealType, setDealType] = useState<string>('Asset Sale');
  const [generatedMilestones, setGeneratedMilestones] = useState<MilestoneItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [disclaimer, setDisclaimer] = useState<string>('');
  
  const { toast } = useToast();
  const { generateMilestones, loading: isGenerating } = useDocumentAI({ dealId });
  
  const handleGenerateMilestones = async () => {
    console.log('🚀 Starting milestone generation process...');
    try {
      console.log('📡 Calling generateMilestones with dealType:', dealType);
      const result = await generateMilestones(dealType);
      console.log('📋 AI Response received:', result);
      
      if (result && result.success && 'milestones' in result && result.milestones) {
        console.log('✅ Valid milestones received, count:', result.milestones.length);
        // Convert to our internal format with all milestones selected
        const milestoneItems = result.milestones.map(m => ({
          ...m,
          selected: true // Auto-select all milestones
        }));
        
        setGeneratedMilestones(milestoneItems);
        setDisclaimer(result.disclaimer || '');
        
      } else {
        console.error('❌ Invalid response format:', result);
        toast({
          title: "Milestone Generation Failed",
          description: "Could not generate milestones. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("💥 Milestone generation error:", error);
      toast({
        title: "Milestone Generation Failed",
        description: error.message || "An error occurred while generating milestones.",
        variant: "destructive",
      });
    }
  };
  
  const autoSaveMilestones = async (milestoneItems: MilestoneItem[]) => {
    try {
      // Delete existing milestones first
      const { error: deleteError } = await supabase
        .from('milestones')
        .delete()
        .eq('deal_id', dealId);
        
      if (deleteError) throw deleteError;
      
      // Prepare milestone data for insertion with fresh order indices
      const milestonesToInsert = milestoneItems.map((milestone, index) => ({
        deal_id: dealId,
        title: milestone.name,
        description: milestone.description,
        status: 'not_started' as MilestoneStatus,
        order_index: (index + 1) * 10
      }));
      
      // Insert new milestones to database
      const { error: insertError } = await supabase
        .from('milestones')
        .insert(milestonesToInsert);
        
      if (insertError) throw insertError;
      
      toast({
        title: "Success!",
        description: `Successfully generated ${milestoneItems.length} milestones with AI`,
      });
      
      // Close dialog and refresh milestone list
      setIsDialogOpen(false);
      setGeneratedMilestones([]);
      onMilestonesAdded();
      
    } catch (error: any) {
      console.error("Auto-save milestones error:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save the generated milestones.",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateMilestone = (index: number, name: string, description: string) => {
    setGeneratedMilestones(prev => 
      prev.map((milestone, i) => 
        i === index 
          ? { ...milestone, name, description }
          : milestone
      )
    );
  };

  const handleToggleMilestone = (index: number) => {
    setGeneratedMilestones(prev => 
      prev.map((m, i) => i === index ? { ...m, selected: !m.selected } : m)
    );
  };
  
  const handleSelectAll = (selected: boolean) => {
    setGeneratedMilestones(prev => 
      prev.map(m => ({ ...m, selected }))
    );
  };
  
  const handleSaveMilestones = async () => {
    setIsSaving(true);
    try {
      const selectedMilestones = generatedMilestones.filter(m => m.selected);
      
      if (selectedMilestones.length === 0) {
        toast({
          title: "No Milestones Selected",
          description: "Please select at least one milestone to add to the deal.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      // Delete existing milestones first
      const { error: deleteError } = await supabase
        .from('milestones')
        .delete()
        .eq('deal_id', dealId);
        
      if (deleteError) throw deleteError;
      
      // Prepare milestone data for insertion with explicit typing for the status
      const milestonesToInsert = selectedMilestones.map((milestone, index) => ({
        deal_id: dealId,
        title: milestone.name,
        description: milestone.description,
        status: 'not_started' as MilestoneStatus, // Using the explicit enum type from types/deal.ts
        order_index: (index + 1) * 10
      }));
      
      // Insert new milestones to database
      const { error: insertError } = await supabase
        .from('milestones')
        .insert(milestonesToInsert);
        
      if (insertError) throw insertError;
      
      toast({
        title: "Success!",
        description: `Successfully generated ${selectedMilestones.length} milestones with AI`,
      });
      
      // Close dialog and refresh milestone list
      setIsDialogOpen(false);
      setGeneratedMilestones([]);
      onMilestonesAdded();
      
    } catch (error: any) {
      console.error("Save milestones error:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save the milestones.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleBackToSelection = () => {
    setGeneratedMilestones([]);
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setGeneratedMilestones([]);
  };
  
  return {
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
  };
};
