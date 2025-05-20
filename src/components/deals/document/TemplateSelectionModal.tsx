
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Define available templates - can be expanded later
const AVAILABLE_TEMPLATES = [
  { id: 'nda', name: 'Non-Disclosure Agreement (NDA)' },
  { id: 'asset-purchase', name: 'Asset Purchase Agreement' },
  { id: 'employment-contract', name: 'Employment Contract' },
  { id: 'lease-agreement', name: 'Commercial Lease Agreement' },
  { id: 'service-agreement', name: 'Service Agreement' }
];

interface TemplateSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onGenerateTemplate: (templateType: string, requirements: string) => Promise<void>;
  isGenerating: boolean;
}

const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({ 
  open, 
  onClose, 
  onGenerateTemplate,
  isGenerating
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');

  const handleGenerateClick = () => {
    if (selectedType) {
      onGenerateTemplate(selectedType, requirements);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setSelectedType('');
    setRequirements('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Document Template</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-type">Template Type</Label>
            <Select 
              value={selectedType} 
              onValueChange={setSelectedType}
            >
              <SelectTrigger id="template-type">
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_TEMPLATES.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requirements">Specific Requirements (Optional)</Label>
            <Textarea
              id="requirements"
              placeholder="Enter any specific requirements or details for this document..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleGenerateClick} 
            disabled={!selectedType || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              'Generate Draft'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelectionModal;
