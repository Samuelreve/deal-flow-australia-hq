
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ContractActions from "@/components/dashboard/contract/ContractActions";
import ContractFeatures from "@/components/dashboard/contract/ContractFeatures";
import { useToast } from "@/components/ui/use-toast";
import { useDocumentUpload } from "@/hooks/documents/useDocumentUpload";
import { FileText } from "lucide-react";

const SmartContractPanel: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const { uploadDocument } = useDocumentUpload();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Get the current user (should be handled by useDocumentUpload)
      // This is just a check for the demo
      const defaultDealId = "demo-deal";
      
      // Upload the document (in a real scenario, we would create a deal first if none exists)
      await uploadDocument({
        file,
        dealId: defaultDealId,
        documentType: 'contract',
        onProgress: (progress: number) => {
          console.log(`Upload progress: ${progress}%`);
        }
      });
      
      toast({
        title: "Contract Uploaded",
        description: "Your contract has been uploaded successfully. Redirecting to analysis..."
      });
      
      // Redirect to the deal/document page
      // In a real scenario, this would redirect to the newly created document
      setTimeout(() => {
        navigate('/deals/new');
      }, 1500);
      
    } catch (error: any) {
      console.error("Error uploading contract:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload contract",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Smart Contract Assistant</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Upload a contract to get AI-powered insights, summaries, and explanations.
          Our AI can analyze legal documents and help you understand complex terms.
        </p>
        
        <ContractFeatures />
        
        <ContractActions 
          isUploading={isUploading} 
          handleFileChange={handleFileChange} 
        />
      </CardContent>
    </Card>
  );
};

export default SmartContractPanel;
