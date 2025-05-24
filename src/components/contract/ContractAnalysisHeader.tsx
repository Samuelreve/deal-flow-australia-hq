
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Brain, Shield, Clock } from "lucide-react";

const ContractAnalysisHeader: React.FC = () => {
  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-blue-900">AI Contract Analysis</CardTitle>
              <CardDescription className="text-blue-700">
                Upload and analyze contracts with AI-powered insights and document review
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Brain className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Brain className="h-4 w-4" />
            <span>Smart document analysis</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Shield className="h-4 w-4" />
            <span>Risk assessment & insights</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Clock className="h-4 w-4" />
            <span>Instant Q&A assistance</span>
          </div>
        </div>
        
        <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Contract Analysis Features:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>• Upload PDFs, Word docs, or text files</div>
            <div>• AI-powered contract summarization</div>
            <div>• Risk identification and assessment</div>
            <div>• Key terms and obligations extraction</div>
            <div>• Interactive Q&A about your contract</div>
            <div>• Clause analysis and recommendations</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractAnalysisHeader;
