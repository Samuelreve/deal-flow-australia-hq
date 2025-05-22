
import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from '@/components/ui/use-toast';
import { useDocumentUpload } from "@/hooks/documents/useDocumentUpload";
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock3,
  Loader2, 
  AlertTriangle, 
  Shield, 
  Scale,
  MessageSquare
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SmartContractPanelProps {
  dealId?: string;
}

const SmartContractPanel: React.FC<SmartContractPanelProps> = ({ dealId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'completed' | 'error'>('idle');
  const { uploadDocument } = useDocumentUpload();
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [demoMode, setDemoMode] = useState(false);
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadStatus('uploading');
      
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 300);
      
      // Get the current user (should be handled by useDocumentUpload)
      // This is just a check for the demo
      const defaultDealId = dealId || "demo-deal";
      
      // Upload the document
      await uploadDocument({
        file,
        dealId: defaultDealId,
        documentType: 'contract',
        onProgress: (progress: number) => {
          console.log(`Upload progress: ${progress}%`);
        }
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('analyzing');
      
      // Simulate analysis time
      setTimeout(() => {
        setUploadStatus('completed');
        setIsUploading(false);
        
        toast({
          title: "Contract Uploaded",
          description: "Your contract has been analyzed successfully."
        });
        
        // Redirect to the deal/document page
        setTimeout(() => {
          navigate(dealId ? `/deals/${dealId}` : '/deals/new');
        }, 1500);
      }, 2500);
      
    } catch (error: any) {
      console.error("Error uploading contract:", error);
      setUploadStatus('error');
      setIsUploading(false);
      
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload contract",
        variant: "destructive"
      });
    }
  };
  
  const handleDemoClick = () => {
    setDemoMode(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 300);
    
    // After "upload" complete
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('analyzing');
      
      // After "analysis" complete
      setTimeout(() => {
        setUploadStatus('completed');
        
        toast({
          title: "Demo Contract Analyzed",
          description: "The NDA has been analyzed successfully."
        });
        
        // Redirect to demo page
        setTimeout(() => {
          navigate('/deals/demo-contract');
        }, 1000);
      }, 3000);
    }, 3000);
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a contract to get AI-powered insights, summaries, and explanations.
              Our AI can analyze legal documents and help you understand complex terms.
            </p>
            
            {uploadStatus === 'idle' && (
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleButtonClick} 
                  className="w-full py-8 flex flex-col items-center justify-center gap-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-dashed border-blue-300"
                >
                  <Upload size={30} />
                  <div className="text-center">
                    <div className="font-semibold">Click to upload</div>
                    <p className="text-xs text-muted-foreground">PDF, DOCX or TXT (max 10MB)</p>
                  </div>
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                />
                
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">Or try a</span>
                  <Button 
                    variant="link" 
                    className="text-blue-600" 
                    onClick={handleDemoClick}
                  >
                    demo contract
                  </Button>
                </div>
              </div>
            )}
            
            {(uploadStatus === 'uploading' || uploadStatus === 'analyzing') && (
              <div className="space-y-4 py-4">
                {uploadStatus === 'uploading' && (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                    <div>
                      <p className="font-medium">Uploading document...</p>
                      <p className="text-sm text-muted-foreground">Please wait while we upload your document</p>
                    </div>
                  </div>
                )}
                
                {uploadStatus === 'analyzing' && (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
                    <div>
                      <p className="font-medium">Analyzing contract...</p>
                      <p className="text-sm text-muted-foreground">Our AI is analyzing your document</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <Progress value={uploadProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{uploadStatus === 'uploading' ? 'Uploading...' : 'Analyzing...'}</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                </div>
              </div>
            )}
            
            {uploadStatus === 'completed' && (
              <div className="bg-green-50 p-4 rounded-md border border-green-200 flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <p className="font-medium text-green-800">Document analysis complete!</p>
                  <p className="text-sm text-green-700">Redirecting you to view the results...</p>
                </div>
              </div>
            )}
            
            {uploadStatus === 'error' && (
              <div className="bg-red-50 p-4 rounded-md border border-red-200 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
                <div>
                  <p className="font-medium text-red-800">Upload failed</p>
                  <p className="text-sm text-red-700">There was an error uploading your document. Please try again.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 bg-white" 
                    onClick={() => setUploadStatus('idle')}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard 
                icon={<FileText className="h-5 w-5 text-blue-600" />}
                title="Contract Summaries"
                description="Get instant summaries of any legal document in plain English"
              />
              <FeatureCard 
                icon={<MessageSquare className="h-5 w-5 text-purple-600" />}
                title="Contract Q&A"
                description="Ask questions about any clause and get clear answers"
              />
              <FeatureCard 
                icon={<Shield className="h-5 w-5 text-red-600" />}
                title="Risk Analysis"
                description="Identify potential risks and issues in your contracts"
              />
              <FeatureCard 
                icon={<Scale className="h-5 w-5 text-amber-600" />}
                title="Legal Explanations"
                description="Understand complex legal terms with simplified explanations"
              />
              <FeatureCard 
                icon={<Clock3 className="h-5 w-5 text-green-600" />}
                title="Version Control"
                description="Track changes and maintain history of all documents"
              />
            </div>
            
            <div className="flex justify-center mt-2">
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Powered by advanced AI technology
              </Badge>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-1">{icon}</div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default SmartContractPanel;
