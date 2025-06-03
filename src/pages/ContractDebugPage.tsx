
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useRealContracts } from '@/hooks/contract/useRealContracts';
import { useContractActions } from '@/hooks/contract/useContractActions';
import { FileText, Upload, Bug, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ContractDebugPage: React.FC = () => {
  const {
    contracts,
    selectedContract,
    loading,
    uploading,
    uploadProgress,
    error,
    uploadContract,
    selectContract
  } = useRealContracts();

  const {
    questionHistory,
    isProcessing,
    handleAskQuestion,
    handleAnalyzeContract
  } = useContractActions(selectedContract);

  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [testQuestionText, setTestQuestionText] = useState('What is the main purpose of this contract?');

  const addDebugLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toISOString();
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    setDebugLogs(prev => [...prev, `[${timestamp}] ${emoji} ${message}`]);
  };

  const clearLogs = () => {
    setDebugLogs([]);
    console.clear();
  };

  const uploadTestTextFile = async () => {
    console.log('🧪 Creating test text file');
    addDebugLog('Creating test text file with known content', 'info');
    
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

This is a comprehensive test contract for debugging AI analysis capabilities.`;

    try {
      const testFile = new File([testContent], 'test-professional-services-agreement.txt', { 
        type: 'text/plain' 
      });

      addDebugLog(`Test file created: ${testFile.name}, size: ${testFile.size} bytes, type: ${testFile.type}`, 'info');
      console.log('📄 Test file details:', {
        name: testFile.name,
        size: testFile.size,
        type: testFile.type,
        contentLength: testContent.length
      });

      const result = await uploadContract(testFile);
      
      if (result) {
        addDebugLog(`✅ Test file upload successful: Contract ID ${result.id}`, 'success');
        addDebugLog(`Content length stored: ${result.content?.length || 0} characters`, 'info');
        console.log('✅ Test upload result:', {
          id: result.id,
          name: result.name,
          contentLength: result.content?.length || 0,
          contentPreview: result.content?.substring(0, 100) + '...'
        });
      } else {
        addDebugLog('❌ Test file upload failed: No result returned', 'error');
      }
    } catch (error) {
      addDebugLog(`❌ Test file upload error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      console.error('❌ Test upload error:', error);
    }
  };

  const testAnalysis = async () => {
    if (!selectedContract) {
      addDebugLog('❌ No contract selected for analysis', 'error');
      return;
    }

    addDebugLog(`🔍 Starting analysis for contract: ${selectedContract.name}`, 'info');
    addDebugLog(`Contract content length: ${selectedContract.content?.length || 0} characters`, 'info');
    
    console.log('🔍 Analysis test starting:', {
      contractId: selectedContract.id,
      contractName: selectedContract.name,
      contentLength: selectedContract.content?.length || 0,
      contentPreview: selectedContract.content?.substring(0, 200) + '...'
    });

    try {
      const result = await handleAnalyzeContract('comprehensive_summary');
      
      if (result && result.analysis) {
        addDebugLog(`✅ Analysis completed successfully: ${result.analysis.length} characters`, 'success');
        console.log('✅ Analysis result:', {
          analysisLength: result.analysis.length,
          analysisPreview: result.analysis.substring(0, 200) + '...'
        });
      } else {
        addDebugLog('❌ Analysis failed: No result returned', 'error');
        console.error('❌ Analysis failed: No result');
      }
    } catch (error) {
      addDebugLog(`❌ Analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      console.error('❌ Analysis error:', error);
    }
  };

  const handleTestQuestion = async () => {
    if (!selectedContract) {
      addDebugLog('❌ No contract selected for question', 'error');
      return;
    }

    addDebugLog(`❓ Testing question: "${testQuestionText}"`, 'info');
    
    try {
      const result = await handleAskQuestion(testQuestionText);
      
      if (result && result.answer) {
        addDebugLog(`✅ Question answered successfully: ${result.answer.length} characters`, 'success');
        console.log('✅ Question result:', {
          question: testQuestionText,
          answerLength: result.answer.length,
          answerPreview: result.answer.substring(0, 200) + '...'
        });
      } else {
        addDebugLog('❌ Question failed: No answer returned', 'error');
      }
    } catch (error) {
      addDebugLog(`❌ Question error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      console.error('❌ Question error:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addDebugLog(`📤 Uploading real file: ${file.name} (${file.type}, ${file.size} bytes)`, 'info');
    console.log('📤 Real file upload starting:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    try {
      const result = await uploadContract(file);
      
      if (result) {
        addDebugLog(`✅ Real file upload successful: ${result.name}`, 'success');
        addDebugLog(`Content extracted: ${result.content?.length || 0} characters`, 'info');
        console.log('✅ Real upload result:', {
          id: result.id,
          name: result.name,
          contentLength: result.content?.length || 0,
          contentPreview: result.content?.substring(0, 200) + '...'
        });
      } else {
        addDebugLog('❌ Real file upload failed: No result returned', 'error');
      }
    } catch (error) {
      addDebugLog(`❌ Real file upload error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      console.error('❌ Real upload error:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bug className="h-8 w-8 text-blue-600" />
          Contract Analysis Debug Console
        </h1>
        <p className="text-muted-foreground mt-2">
          Use this page to debug text extraction and AI analysis issues step by step.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Testing Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Debug Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Step 1: Test Known-Good Text File</h3>
              <Button onClick={uploadTestTextFile} disabled={uploading || loading} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Test Text File
              </Button>
              <p className="text-xs text-muted-foreground">
                This creates a test .txt file with known content to verify the basic pipeline works.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Step 2: Test Real PDF/DOCX Files</h3>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.rtf"
                onChange={handleFileUpload}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={uploading || loading}
              />
              <p className="text-xs text-muted-foreground">
                Upload a real PDF or DOCX file to test text extraction.
              </p>
            </div>

            {selectedContract && (
              <div className="space-y-2">
                <h3 className="font-semibold">Step 3: Test AI Analysis</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm"><strong>Selected:</strong> {selectedContract.name}</p>
                  <p className="text-sm"><strong>Content:</strong> {selectedContract.content?.length || 0} characters</p>
                </div>
                <Button onClick={testAnalysis} disabled={isProcessing} className="w-full">
                  Test Summary Generation
                </Button>
                
                 <div className="space-y-2">
                   <Textarea
                     value={testQuestionText}
                     onChange={(e) => setTestQuestionText(e.target.value)}
                     placeholder="Enter test question..."
                     rows={2}
                   />
                   <Button onClick={handleTestQuestion} disabled={isProcessing} className="w-full">
                     Test Q&A
                   </Button>
                 </div>
              </div>
            )}

            <Button onClick={clearLogs} variant="outline" className="w-full">
              Clear Console & Logs
            </Button>
          </CardContent>
        </Card>

        {/* Current State */}
        <Card>
          <CardHeader>
            <CardTitle>Current State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Badge variant={uploading ? "default" : "secondary"}>
                  {uploading ? "Uploading..." : "Ready"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">Upload Status</p>
              </div>
              <div>
                <Badge variant={isProcessing ? "default" : "secondary"}>
                  {isProcessing ? "Processing..." : "Idle"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">AI Status</p>
              </div>
            </div>

            {uploadProgress > 0 && (
              <div>
                <div className="flex justify-between text-sm">
                  <span>Upload Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <h4 className="font-medium mb-2">Contracts ({contracts.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {contracts.map((contract) => (
                  <div 
                    key={contract.id}
                    className={`p-2 border rounded cursor-pointer ${
                      selectedContract?.id === contract.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => selectContract(contract.id)}
                  >
                    <p className="text-sm font-medium">{contract.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {contract.content?.length || 0} chars | {contract.created_at ? new Date(contract.created_at).toLocaleString() : 'Unknown date'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Logs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Debug Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-80 overflow-y-auto">
              {debugLogs.length === 0 ? (
                <p className="text-gray-500">No debug logs yet. Run some tests to see output here.</p>
              ) : (
                debugLogs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Also check your browser's console (F12) for additional technical details.
            </p>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>How to Use This for Debugging</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium">1. Clear the Console & Open Browser DevTools</h4>
              <p className="text-sm text-muted-foreground">
                Click "Clear Console & Logs" above, then press F12 to open browser DevTools. Go to Console tab.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">2. Test with Known-Good Text File</h4>
              <p className="text-sm text-muted-foreground">
                Click "Upload Test Text File" and watch both the debug logs above and browser console. 
                This should work perfectly and give you a baseline.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">3. Test with Real PDF/DOCX</h4>
              <p className="text-sm text-muted-foreground">
                Upload a real PDF or Word document. Watch for differences in the console logs compared to the text file.
                Look for content length differences and any extraction errors.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">4. Check Edge Function Logs</h4>
              <p className="text-sm text-muted-foreground">
                In Supabase Dashboard → Edge Functions → contract-assistant → Logs tab, 
                look for the content being sent to OpenAI. Is it the placeholder message or actual extracted text?
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">5. Test AI Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Once a contract is selected, test the summary generation and Q&A to see if the AI pipeline works with the extracted content.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractDebugPage;
