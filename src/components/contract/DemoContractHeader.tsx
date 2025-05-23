
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles, Clock, CheckCircle } from "lucide-react";

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
              <CardTitle className="text-xl text-blue-900">Interactive Contract Demo</CardTitle>
              <CardDescription className="text-blue-700">
                Experience our AI-powered contract analysis with a real Mutual NDA
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Analysis Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Sparkles className="h-4 w-4" />
            <span>AI-powered insights ready</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Clock className="h-4 w-4" />
            <span>3-year term + 5-year survival</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <CheckCircle className="h-4 w-4" />
            <span>Low-medium risk profile</span>
          </div>
        </div>
        
        <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Try These Demo Features:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>• Ask questions about contract terms</div>
            <div>• Review AI-generated summary</div>
            <div>• Explore risk assessment</div>
            <div>• Check key obligations</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoContractHeader;
