
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DebugContractUpload from '@/components/contract/DebugContractUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, AlertTriangle } from 'lucide-react';

const ContractDebugPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="container py-6 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-6 w-6 text-orange-600" />
                Contract Analysis Debug Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-orange-900">Debug Purpose</h3>
                    <p className="text-sm text-orange-800 mt-1">
                      This page helps debug text extraction and AI analysis issues. 
                      Follow the step-by-step process to identify where the pipeline breaks.
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <h4 className="font-medium mb-2">What to monitor:</h4>
                  <ul className="space-y-1 ml-4">
                    <li>• Browser console logs (F12 → Console)</li>
                    <li>• File upload progress and content length</li>
                    <li>• Supabase Edge Function logs</li>
                    <li>• AI response generation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <DebugContractUpload />
        </div>
      </div>
    </AppLayout>
  );
};

export default ContractDebugPage;
