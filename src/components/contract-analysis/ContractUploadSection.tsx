
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Upload, File, Brain } from "lucide-react";

interface ContractUploadSectionProps {
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ContractUploadSection: React.FC<ContractUploadSectionProps> = ({ handleFileUpload }) => {
  const handleDemoUpload = () => {
    // Create a demo contract content
    const demoContent = `PROFESSIONAL SERVICES AGREEMENT

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

This is a comprehensive demo contract for testing AI analysis capabilities with enhanced features.`;

    // Create a proper File object using the global File constructor
    const demoFile = new (globalThis.File || window.File)([demoContent], 'demo-professional-services-agreement.txt', { 
      type: 'text/plain' 
    });

    // Create a proper synthetic event object that matches React.ChangeEvent<HTMLInputElement>
    const syntheticEvent = {
      target: {
        files: [demoFile] as any,
        value: ''
      },
      currentTarget: {
        files: [demoFile] as any,
        value: ''
      },
      nativeEvent: new Event('change'),
      bubbles: false,
      cancelable: false,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: false,
      preventDefault: () => {},
      isDefaultPrevented: () => false,
      stopPropagation: () => {},
      isPropagationStopped: () => false,
      persist: () => {},
      timeStamp: Date.now(),
      type: 'change'
    } as React.ChangeEvent<HTMLInputElement>;

    // Call the upload handler with the synthetic event
    handleFileUpload(syntheticEvent);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Brain className="h-6 w-6 text-blue-600" />
          Enhanced Contract AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your contract here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Enhanced support for multiple file formats with AI-powered analysis
            </p>
            <p className="text-xs text-gray-400">
              Now supports PDF and Word (.docx) files up to 25MB
            </p>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              or try our enhanced demo contract
            </p>
            <Button
              onClick={handleDemoUpload}
              variant="outline"
              className="w-full max-w-xs"
            >
              <FileText className="mr-2 h-4 w-4" />
              Load Demo Professional Services Agreement
            </Button>
          </div>

          {/* Enhanced file type support showcase */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <File className="h-4 w-4" />
              Enhanced File Type Support:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-red-600" />
                <span><strong>PDF documents</strong> with advanced OCR</span>
              </div>
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-blue-600" />
                <span><strong>Word documents</strong> (.docx)</span>
              </div>
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-green-600" />
                <span><strong>Text files</strong> for instant processing</span>
              </div>
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-purple-600" />
                <span><strong>RTF documents</strong> with rich formatting</span>
              </div>
            </div>
          </div>

          {/* Enhanced AI Features Preview */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Advanced AI Analysis Features:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span><strong>Smart summaries</strong> with key insights</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span><strong>Legal term explanations</strong> in plain English</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span><strong>Risk identification</strong> and mitigation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span><strong>Interactive Q&A</strong> for any contract clause</span>
              </div>
            </div>
          </div>

          {/* Processing Information */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> PDF and Word documents may take longer to process due to advanced text extraction. 
              For immediate analysis, consider uploading text files.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractUploadSection;
