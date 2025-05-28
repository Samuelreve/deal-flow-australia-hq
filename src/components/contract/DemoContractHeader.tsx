
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles, Clock, Upload } from "lucide-react";

const DemoContractHeader: React.FC = () => {
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
                Upload any contract for instant AI-powered analysis and insights
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Upload className="h-3 w-3 mr-1" />
            Ready to Analyze
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Sparkles className="h-4 w-4" />
            <span>Real AI-powered analysis</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Clock className="h-4 w-4" />
            <span>Instant contract insights</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <FileText className="h-4 w-4" />
            <span>Ask questions about clauses</span>
          </div>
        </div>
        
        <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Get Started:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>• Upload your contract document</div>
            <div>• Get AI-generated analysis</div>
            <div>• Ask questions about specific terms</div>
            <div>• Review risk assessments</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoContractHeader;
