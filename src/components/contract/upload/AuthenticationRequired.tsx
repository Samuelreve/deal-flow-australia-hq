
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, AlertCircle } from 'lucide-react';

const AuthenticationRequired: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Contract for AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to upload and analyze contracts with AI assistance.
          </AlertDescription>
        </Alert>
        <Button disabled className="w-full mt-4">
          <Upload className="mr-2 h-4 w-4" />
          Login Required
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuthenticationRequired;
