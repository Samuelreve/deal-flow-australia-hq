
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Download, FileText, File } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generatePDF, generateDocx, generateTextFile } from "@/utils/pdfGenerator";
import { toast } from "sonner";

// Define document categories - these should match the ones in DocumentUploadForm
const documentCategories = [
  'NDA',
  'Financial',
  'Legal', 
  'Operational',
  'Marketing',
  'Other'
];

interface GeneratedDocumentReviewProps {
  open: boolean;
  onClose: () => void;
  initialText: string;
  isSaving: boolean;
  onSave: (text: string, filename: string, category: string) => Promise<void>;
}

const GeneratedDocumentReview: React.FC<GeneratedDocumentReviewProps> = ({
  open,
  onClose,
  initialText,
  isSaving,
  onSave,
}) => {
  const [editedText, setEditedText] = useState(initialText);
  const [filename, setFilename] = useState(`Generated_Document_${new Date().toISOString().split('T')[0]}.txt`);
  const [category, setCategory] = useState('Legal');

  // Update state when initialText changes
  useEffect(() => {
    setEditedText(initialText);
  }, [initialText]);

  const handleSave = () => {
    onSave(editedText, filename, category);
  };

  const handleExportPDF = () => {
    try {
      const cleanFilename = filename.replace(/\.[^/.]+$/, ""); // Remove extension
      generatePDF(editedText, cleanFilename);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error("PDF generation error:", error);
    }
  };

  const handleExportDocx = async () => {
    try {
      const cleanFilename = filename.replace(/\.[^/.]+$/, ""); // Remove extension
      await generateDocx(editedText, cleanFilename);
      toast.success("DOCX downloaded successfully");
    } catch (error) {
      toast.error("Failed to generate DOCX");
      console.error("DOCX generation error:", error);
    }
  };

  const handleExportText = () => {
    try {
      const cleanFilename = filename.replace(/\.[^/.]+$/, ""); // Remove extension
      generateTextFile(editedText, cleanFilename);
      toast.success("Text file downloaded successfully");
    } catch (error) {
      toast.error("Failed to generate text file");
      console.error("Text file generation error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Generated Document</DialogTitle>
        </DialogHeader>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is an AI-generated draft and should be reviewed by a qualified legal professional before use.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document-name">Document Name</Label>
              <Input
                id="document-name"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="document-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="document-content">Document Content</Label>
            <Textarea
              id="document-content"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
          </div>
        </div>
        
        <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportText}
              className="flex items-center space-x-1"
            >
              <FileText className="h-4 w-4" />
              <span>Export TXT</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="flex items-center space-x-1"
            >
              <File className="h-4 w-4" />
              <span>Export PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDocx}
              className="flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Export DOCX</span>
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save as Document'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GeneratedDocumentReview;
