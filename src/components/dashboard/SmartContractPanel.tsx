
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDocumentUploadService } from "@/hooks/useDocumentUploadService";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SmartContractPanelProps {
  dealId?: string;
}

const SmartContractPanel: React.FC<SmartContractPanelProps> = ({ dealId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const { uploadDocument, uploading } = useDocumentUploadService();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // If we're on the homepage and no dealId is provided, ask user to select a deal
    if (!dealId) {
      // Navigate to the deals page where they can select a specific deal
      toast({
        title: "Select a deal first",
        description: "Please select a deal to upload your contract to.",
      });
      navigate('/deals');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Upload the document with "contract" category
      const result = await uploadDocument(file, dealId, "contract");
      
      if (result) {
        toast({
          title: "Contract uploaded",
          description: "Your contract has been uploaded successfully. You can now use the Smart Contract Assistant.",
        });
        
        // Navigate to the document view with a flag to open the analyzer
        navigate(`/deals/${dealId}/documents?analyze=true&docId=${result.document.id}&versionId=${result.version.id}`);
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload contract",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const navigateToDeals = () => {
    // Navigate to deals page so user can select a deal
    navigate('/deals');
  };

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          Smart Contract Assistant
        </CardTitle>
        <CardDescription>
          Upload any contract to get instant analysis and understanding
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm">What our AI can do:</h4>
            <ul className="text-sm mt-2 space-y-1.5">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span> 
                <span>Summarize key terms and sections</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span> 
                <span>Explain legal clauses in plain English</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span> 
                <span>Answer questions about the contract</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-2">
            {dealId ? (
              // If a specific deal is selected (on dashboard)
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="w-full relative overflow-hidden" 
                  disabled={isUploading || !user}
                >
                  <label 
                    htmlFor="contract-upload" 
                    className="absolute inset-0 cursor-pointer flex items-center justify-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload a Contract"}
                  </label>
                </Button>
                <input 
                  type="file" 
                  id="contract-upload" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                  disabled={isUploading || !user}
                />
              </div>
            ) : (
              // If no deal is selected (on homepage)
              <Button 
                variant="outline" 
                onClick={navigateToDeals}
                className="w-full"
                disabled={!user}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload a Contract
              </Button>
            )}
            
            <Button 
              variant="default" 
              onClick={navigateToDeals}
              className="w-full"
            >
              Go to My Deals
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            This tool provides general legal information, not legal advice.
            Always consult a lawyer for final review.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartContractPanel;
