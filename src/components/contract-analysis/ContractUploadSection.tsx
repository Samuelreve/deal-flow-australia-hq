
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle } from "lucide-react";

interface ContractUploadSectionProps {
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ContractUploadSection: React.FC<ContractUploadSectionProps> = ({ handleFileUpload }) => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <FileText className="h-6 w-6" />
          Upload Contract for AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag and drop your contract here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files
            </p>
            <p className="text-xs text-gray-400">
              Supports PDF, DOCX, and TXT files
            </p>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              or try our demo contract
            </p>
            <Button
              onClick={() => handleFileUpload({ target: { files: [new File([''], 'demo.pdf')] } } as any)}
              variant="outline"
              className="w-full max-w-xs"
            >
              Load Demo Contract
            </Button>
          </div>

          {/* AI Features Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-blue-900 mb-3">AI Analysis Features:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span>Instant contract summaries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span>Complex term explanations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span>Risk identification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span>Interactive Q&A</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractUploadSection;
