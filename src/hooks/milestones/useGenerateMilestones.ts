
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
    try {
      const result = await generateMilestones(dealType);
      
      if (result && 'milestones' in result) {
        // Convert to our internal format with all milestones selected
        const milestoneItems = (result as MilestoneGenerationResponse).milestones.map(m => ({
          ...m,
          selected: true // Auto-select all milestones
        }));
        
        setGeneratedMilestones(milestoneItems);
        setDisclaimer((result as MilestoneGenerationResponse).disclaimer || '');
        
        // Automatically save all generated milestones
        await autoSaveMilestones(milestoneItems);
        
      } else {
        toast({
          title: "Milestone Generation Failed",
          description: "Could not generate milestones. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Milestone generation error:", error);
      toast({
        title: "Milestone Generation Failed",
        description: error.message || "An error occurred while generating milestones.",
        variant: "destructive",
      });
    }
  };
  
  const autoSaveMilestones = async (milestoneItems: MilestoneItem[]) => {
    try {
      // Get current highest order_index
      const { data: existingMilestones, error: fetchError } = await supabase
        .from('milestones')
        .select('order_index')
        .eq('deal_id', dealId)
        .order('order_index', { ascending: false })
        .limit(1);
        
      if (fetchError) throw fetchError;
      
      const startOrderIndex = existingMilestones && existingMilestones.length > 0 
        ? existingMilestones[0].order_index + 10
        : 10;
      
      // Prepare milestone data for insertion
      const milestonesToInsert = milestoneItems.map((milestone, index) => ({
        deal_id: dealId,
        title: milestone.name,
        description: milestone.description,
        status: 'not_started' as MilestoneStatus,
        order_index: startOrderIndex + (index * 10)
      }));
      
      // Insert milestones to database
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
      
      // Get current highest order_index
      const { data: existingMilestones, error: fetchError } = await supabase
        .from('milestones')
        .select('order_index')
        .eq('deal_id', dealId)
        .order('order_index', { ascending: false })
        .limit(1);
        
      if (fetchError) throw fetchError;
      
      const startOrderIndex = existingMilestones && existingMilestones.length > 0 
        ? existingMilestones[0].order_index + 10
        : 10;
      
      // Prepare milestone data for insertion with explicit typing for the status
      const milestonesToInsert = selectedMilestones.map((milestone, index) => ({
        deal_id: dealId,
        title: milestone.name,
        description: milestone.description,
        status: 'not_started' as MilestoneStatus, // Using the explicit enum type from types/deal.ts
        order_index: startOrderIndex + (index * 10)
      }));
      
      // Insert milestones to database
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
    handleToggleMilestone,
    handleSelectAll,
    handleSaveMilestones,
    handleBackToSelection,
    closeDialog
  };
};
