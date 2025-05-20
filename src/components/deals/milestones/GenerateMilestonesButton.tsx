
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useDocumentAI } from "@/hooks/document-ai/useDocumentAI";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { MilestoneGenerationResponse } from "@/hooks/document-ai/types";

interface MilestoneItem {
  name: string;
  description: string;
  order: number;
  selected: boolean;
}

interface GenerateMilestonesButtonProps {
  dealId: string;
  onMilestonesAdded: () => void;
  userRole?: string;
  className?: string;
}

const DEAL_TYPES = [
  { value: 'Asset Sale', label: 'Asset Sale' },
  { value: 'Share Sale', label: 'Share Sale' },
  { value: 'Commercial Property', label: 'Commercial Property' },
  { value: 'Merger', label: 'Merger' },
  { value: 'Joint Venture', label: 'Joint Venture' },
];

const GenerateMilestonesButton: React.FC<GenerateMilestonesButtonProps> = ({ 
  dealId, 
  onMilestonesAdded,
  userRole = 'user',
  className
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dealType, setDealType] = useState<string>('Asset Sale');
  const [generatedMilestones, setGeneratedMilestones] = useState<MilestoneItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [disclaimer, setDisclaimer] = useState<string>('');
  
  const { toast } = useToast();
  const { generateMilestones, loading: isGenerating } = useDocumentAI({ dealId });
  
  // Check if user role allows milestone generation
  const canGenerateMilestones = ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase());
  
  if (!canGenerateMilestones) {
    return null;
  }
  
  const handleGenerateMilestones = async () => {
    try {
      const result = await generateMilestones(dealType);
      
      if (result && 'milestones' in result) {
        // Convert to our internal format with selected flag
        const milestoneItems = (result as MilestoneGenerationResponse).milestones.map(m => ({
          ...m,
          selected: true // Default select all milestones
        }));
        
        setGeneratedMilestones(milestoneItems);
        setDisclaimer((result as MilestoneGenerationResponse).disclaimer || '');
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
      
      // Prepare milestone data for insertion
      const milestonesToInsert = selectedMilestones.map((milestone, index) => ({
        deal_id: dealId,
        title: milestone.name,
        description: milestone.description,
        status: 'not_started',
        order_index: startOrderIndex + (index * 10)
      }));
      
      // Insert milestones to database
      const { error: insertError } = await supabase
        .from('milestones')
        .insert(milestonesToInsert);
        
      if (insertError) throw insertError;
      
      toast({
        title: "Milestones Added",
        description: `${selectedMilestones.length} milestone(s) have been added to the deal.`,
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
            // Deal type selection form
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleGenerateMilestones} 
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
          ) : (
            // Milestone review and selection form
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Generated Milestones</h3>
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSelectAll(true)}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSelectAll(false)}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto pr-2">
                {generatedMilestones.map((milestone, index) => (
                  <div key={index} className="flex items-start space-x-3 py-3 border-b last:border-0">
                    <Checkbox 
                      checked={milestone.selected}
                      onCheckedChange={() => handleToggleMilestone(index)}
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
                  onClick={() => setGeneratedMilestones([])}
                  disabled={isSaving}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSaveMilestones}
                  disabled={isSaving || generatedMilestones.filter(m => m.selected).length === 0}
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
          )}
          
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GenerateMilestonesButton;
