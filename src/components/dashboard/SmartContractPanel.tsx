
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useDocumentUpload } from "@/hooks/documents/useDocumentUpload";
import { Loader, FileText, Upload, Check, Brain, Search, AlertTriangle, MessageSquare } from "lucide-react";
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
      toast.success("Contract Uploaded Successfully!", {
        description: "Your contract has been uploaded and is being analyzed by our AI. All features are now available."
      });
      
      // Redirect after a brief delay to show the success state
      setTimeout(() => {
        // Navigate to document page with analyze=true parameter to trigger AI analysis
        navigate(
          dealId 
            ? `/deals/${dealId}/documents?analyze=true&docId=${uploadedDoc?.id}&versionId=${uploadedDoc?.latestVersionId}` 
            : '/demo/contract?analyze=true'
        );
      }, 1500);
      
    } catch (error: any) {
      console.error("Error uploading contract:", error);
      toast.error("Upload Failed", {
        description: error.message || "Failed to upload contract. Please try again."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const aiFeatures = [
    {
      icon: <Brain className="h-4 w-4 text-blue-500" />,
      title: "Smart Summarization",
      description: "Get instant summaries in plain language"
    },
    {
      icon: <Search className="h-4 w-4 text-green-500" />,
      title: "Term Explanation", 
      description: "Understand complex legal terminology"
    },
    {
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      title: "Risk Analysis",
      description: "Identify potential risks and red flags"
    },
    {
      icon: <MessageSquare className="h-4 w-4 text-purple-500" />,
      title: "Q&A Assistant",
      description: "Ask questions about any part of your contract"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-blue-900">Smart Contract Assistant</CardTitle>
            <p className="text-sm text-blue-600 mt-1">AI-Powered Contract Analysis</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium mb-2">✨ AI Features Available:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                {feature.icon}
                <div>
                  <p className="text-xs font-medium text-blue-900">{feature.title}</p>
                  <p className="text-xs text-blue-700">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md">
            {!isUploading && !uploadComplete ? (
              <div className="space-y-3">
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
                  className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg border-blue-300 cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors group"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-10 w-10 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-blue-700">Upload Contract for AI Analysis</p>
                    <p className="text-xs text-blue-600 mt-1">(PDF, DOCX or TXT files)</p>
                    <p className="text-xs text-blue-500 mt-2 text-center px-4">
                      Our AI will automatically analyze and provide insights
                    </p>
                  </div>
                </label>
                
                <div className="text-center">
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={() => navigate('/demo/contract')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Try Demo Contract →
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-blue-200 rounded-lg p-4 w-full">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium truncate text-blue-900">
                    {fileName}
                  </span>
                  {uploadComplete && <Check className="h-4 w-4 text-green-500" />}
                </div>

                <div className="w-full bg-blue-100 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-blue-700">
                  <span>
                    {uploadComplete ? 'Ready for AI Analysis!' : 'Uploading & Preparing...'}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                
                {uploadComplete && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                    ✅ Upload complete! Redirecting to AI analysis...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="text-xs text-blue-600 w-full text-center bg-blue-50 rounded p-2">
          🔒 Secure AI processing • Your documents are protected
        </div>
      </CardFooter>
    </Card>
  );
};

export default SmartContractPanel;
