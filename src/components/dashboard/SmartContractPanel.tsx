
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useDocumentUpload } from "@/hooks/documents/useDocumentUpload";
import { Loader, FileText, Upload, Check } from "lucide-react";
import { toast } from "sonner";

interface SmartContractPanelProps {
  dealId?: string;
}

const SmartContractPanel: React.FC<SmartContractPanelProps> = ({ dealId }) => {
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const { uploadDocument } = useDocumentUpload();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a PDF, DOCX, or plain text file"
      });
      return;
    }
    
    setFileName(file.name);
    setUploadProgress(0);
    setIsUploading(true);
    setUploadComplete(false);
    
    try {
      // Get the current user (should be handled by useDocumentUpload)
      // This is just a check for the demo
      const defaultDealId = dealId || "demo-deal";
      
      // Upload the document (in a real scenario, we would create a deal first if none exists)
      const uploadedDoc = await uploadDocument({
        file,
        dealId: defaultDealId,
        documentType: 'contract',
        onProgress: (progress: number) => {
          setUploadProgress(progress);
        }
      });
      
      setUploadComplete(true);
      toast.success("Contract Uploaded", {
        description: "Your contract has been uploaded successfully. Analyzing content..."
      });
      
      // Redirect after a brief delay to show the success state
      setTimeout(() => {
        // Navigate to document page with analyze=true parameter
        navigate(
          dealId 
            ? `/deals/${dealId}/documents?analyze=true&docId=${uploadedDoc?.id}&versionId=${uploadedDoc?.latestVersionId}` 
            : '/demo/contract?analyze=true'
        );
      }, 1500);
      
    } catch (error: any) {
      console.error("Error uploading contract:", error);
      toast.error("Upload Failed", {
        description: error.message || "Failed to upload contract"
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
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">What our AI can do:</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5" />
              <span>Summarize contracts in simple language</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5" />
              <span>Explain complex legal terms</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5" />
              <span>Identify potential risks or red flags</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5" />
              <span>Answer questions about the document</span>
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md">
            {!isUploading && !uploadComplete ? (
              <div className="space-y-2">
                <input 
                  type="file" 
                  id="contract-upload" 
                  className="hidden" 
                  accept=".pdf,.docx,.doc,.txt" 
                  onChange={handleFileChange} 
                  disabled={isUploading} 
                />
                <label 
                  htmlFor="contract-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-gray-300 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload a contract</p>
                    <p className="text-xs text-gray-500 mt-1">(PDF, DOCX or TXT)</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium truncate">
                    {fileName}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                  <span>{uploadComplete ? 'Complete!' : 'Uploading...'}</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="text-xs text-muted-foreground w-full text-center">
          By uploading, you agree to our Terms of Service and Privacy Policy
        </div>
      </CardFooter>
    </Card>
  );
};

export default SmartContractPanel;
