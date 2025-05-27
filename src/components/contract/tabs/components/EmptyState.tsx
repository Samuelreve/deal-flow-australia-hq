
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Upload, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  hasContract?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasContract = false }) => {
  if (!hasContract) {
    return (
      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Contract Uploaded</h3>
          <p className="text-gray-500 mb-4">
            Upload a contract to start asking questions and get AI-powered analysis.
          </p>
          <div className="text-sm text-gray-400">
            Supported formats: PDF, DOC, DOCX, TXT
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-blue-600 mr-2" />
          <MessageSquare className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-blue-900 mb-2">AI Assistant Ready</h3>
        <p className="text-blue-700 mb-4">
          Your contract has been uploaded! Start by asking a question or running an analysis.
        </p>
        <div className="text-sm text-blue-600 space-y-1">
          <div>💡 Try asking: "What are the termination clauses?"</div>
          <div>💡 Or: "Who are the parties in this contract?"</div>
          <div>💡 Or: "What are the payment terms?"</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
