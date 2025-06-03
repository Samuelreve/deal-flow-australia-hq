
import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useRealContracts } from '@/hooks/contract/useRealContracts';
import { toast } from 'sonner';

const DebugContractUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [debugInfo, setDebugInfo] = useState<{
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    extractedLength?: number;
    extractedPreview?: string;
    uploadStage?: string;
    error?: string;
  }>({});

  const {
    contracts,
    selectedContract,
    loading,
    uploading,
    uploadProgress,
    error: contractsError,
    uploadContract,
    selectContract
  } = useRealContracts();

  const createTestTextFile = () => {
    const testContent = `PROFESSIONAL SERVICES AGREEMENT

This Professional Services Agreement ("Agreement") is entered into on January 15, 2024, between TechCorp Solutions, LLC, a limited liability company organized under the laws of Delaware ("Company"), and Digital Innovations Consulting ("Consultant").

1. SCOPE OF SERVICES
Consultant agrees to provide the following services:
- Software development and implementation
- Technical consultation and system analysis
- Project management and delivery oversight
- Quality assurance and testing services

2. COMPENSATION AND PAYMENT TERMS
Company agrees to pay Consultant a total fee of $75,000 for the services outlined herein, payable according to the following schedule:
- 30% upon execution of this Agreement ($22,500)
- 40% upon completion of Phase 1 deliverables ($30,000)
- 30% upon final delivery and acceptance ($22,500)

3. TERM AND TERMINATION
This Agreement shall commence on February 1, 2024, and shall continue until December 31, 2024, unless terminated earlier in accordance with the provisions herein. Either party may terminate this Agreement with thirty (30) days written notice.

4. INTELLECTUAL PROPERTY RIGHTS
All work product, inventions, and intellectual property created by Consultant in the performance of services under this Agreement shall be the exclusive property of Company.

5. CONFIDENTIALITY AND NON-DISCLOSURE
Consultant acknowledges that during the performance of services, Consultant may have access to confidential and proprietary information of Company. Consultant agrees to maintain strict confidentiality and not disclose such information to any third party.

6. LIABILITY AND INDEMNIFICATION
Consultant's total liability under this Agreement shall not exceed the total amount of fees paid to Consultant. Each party agrees to indemnify and hold harmless the other party from claims arising from their respective negligent acts or omissions.

7. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles.

8. DISPUTE RESOLUTION
Any disputes arising under this Agreement shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.

This is a comprehensive test contract for debugging AI analysis capabilities with enhanced logging and detailed monitoring of the text extraction process. The content should be sufficient to generate meaningful AI summaries and analysis.`;

    const blob = new Blob([testContent], { type: 'text/plain' });
    const file = new File([blob], 'debug_test_contract.txt', { type: 'text/plain' });
    
    setDebugInfo({
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      extractedLength: testContent.length,
      extractedPreview: testContent.substring(0, 200),
      uploadStage: 'Test file created'
    });

    return file;
  };

  const handleTestUpload = async () => {
    const testFile = createTestTextFile();
    
    setDebugInfo(prev => ({
      ...prev,
      uploadStage: 'Starting upload...'
    }));

    try {
      console.log('🧪 DEBUG: Starting test file upload');
      console.log('🧪 DEBUG: File details:', {
        name: testFile.name,
        size: testFile.size,
        type: testFile.type
      });

      const result = await uploadContract(testFile);
      
      if (result) {
        console.log('🧪 DEBUG: Upload successful:', result);
        setDebugInfo(prev => ({
          ...prev,
          uploadStage: 'Upload completed successfully!',
          error: undefined
        }));
        toast.success('Test file uploaded successfully!');
      } else {
        console.error('🧪 DEBUG: Upload failed - no result');
        setDebugInfo(prev => ({
          ...prev,
          error: 'Upload failed - no result returned'
        }));
      }
    } catch (error) {
      console.error('🧪 DEBUG: Upload error:', error);
      setDebugInfo(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        uploadStage: 'Upload failed'
      }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('🧪 DEBUG: Real file upload started');
    console.log('🧪 DEBUG: File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    setDebugInfo({
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadStage: 'Processing real file...'
    });

    try {
      const result = await uploadContract(file);
      
      if (result) {
        console.log('🧪 DEBUG: Real file upload successful:', result);
        setDebugInfo(prev => ({
          ...prev,
          uploadStage: 'Real file uploaded successfully!',
          error: undefined
        }));
        toast.success('File uploaded successfully!');
      } else {
        console.error('🧪 DEBUG: Real file upload failed');
        setDebugInfo(prev => ({
          ...prev,
          error: 'Upload failed'
        }));
      }
    } catch (error) {
      console.error('🧪 DEBUG: Real file upload error:', error);
      setDebugInfo(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Debug Contract Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test File Upload */}
          <div className="space-y-2">
            <h3 className="font-medium">Step 1: Test with Known-Good Text File</h3>
            <Button onClick={handleTestUpload} disabled={uploading} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Upload Test Text File (Large Content)
            </Button>
          </div>

          {/* Real File Upload */}
          <div className="space-y-2">
            <h3 className="font-medium">Step 2: Test with Your PDF/DOCX File</h3>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt,.rtf"
              className="hidden"
              disabled={uploading}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploading}
              variant="outline"
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose PDF/DOCX File to Test
            </Button>
          </div>

          {/* Debug Information */}
          {Object.keys(debugInfo).length > 0 && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Debug Information:</h4>
              
              {debugInfo.fileName && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">File Name</Badge>
                  <span className="text-sm">{debugInfo.fileName}</span>
                </div>
              )}
              
              {debugInfo.fileSize && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">File Size</Badge>
                  <span className="text-sm">{debugInfo.fileSize.toLocaleString()} bytes</span>
                </div>
              )}
              
              {debugInfo.fileType && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">File Type</Badge>
                  <span className="text-sm">{debugInfo.fileType}</span>
                </div>
              )}
              
              {debugInfo.extractedLength && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Content Length</Badge>
                  <span className="text-sm">{debugInfo.extractedLength.toLocaleString()} characters</span>
                </div>
              )}
              
              {debugInfo.uploadStage && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Stage</Badge>
                  <span className="text-sm">{debugInfo.uploadStage}</span>
                </div>
              )}
              
              {debugInfo.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{debugInfo.error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 bg-gray-200 rounded-full flex-1">
                  <div 
                    className="h-2 bg-blue-600 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
            </div>
          )}

          {/* Current Contracts */}
          {contracts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Current Contracts:</h4>
              {contracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{contract.name}</span>
                    {contract.content && (
                      <Badge variant="outline" className="ml-2">
                        {contract.content.length.toLocaleString()} chars
                      </Badge>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => selectContract(contract.id)}
                    variant={selectedContract?.id === contract.id ? "default" : "outline"}
                  >
                    {selectedContract?.id === contract.id ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      'Select'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Instructions:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>First, test with the generated text file to confirm the flow works</li>
                <li>Check the browser console (F12) for detailed logs</li>
                <li>Then test with your PDF/DOCX file</li>
                <li>Compare the content lengths and any error messages</li>
                <li>Check the Supabase Edge Function logs for detailed server-side information</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugContractUpload;
