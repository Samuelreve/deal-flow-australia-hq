
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Upload, FileX } from "lucide-react";

interface ContractErrorProps {
  error: string;
  onRetry?: () => void;
  onReset?: () => void;
}

export const ContractUploadError: React.FC<ContractErrorProps> = ({
  error,
  onRetry,
  onReset
}) => (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Upload Failed</AlertTitle>
    <AlertDescription className="mt-2">
      <p className="mb-4">{error}</p>
      <div className="flex gap-2">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Try Again
          </Button>
        )}
        {onReset && (
          <Button variant="outline" size="sm" onClick={onReset}>
            <Upload className="h-3 w-3 mr-1" />
            Choose Different File
          </Button>
        )}
      </div>
    </AlertDescription>
  </Alert>
);

export const ContractAnalysisError: React.FC<ContractErrorProps> = ({
  error,
  onRetry
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-destructive">
        <FileX className="h-5 w-5" />
        Analysis Failed
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground mb-4">{error}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Analysis
        </Button>
      )}
    </CardContent>
  </Card>
);

export const ContractNotFoundError: React.FC<{ onBackToList?: () => void }> = ({
  onBackToList
}) => (
  <Card>
    <CardContent className="p-8 text-center">
      <FileX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Contract Not Found</h3>
      <p className="text-muted-foreground mb-4">
        The contract you're looking for doesn't exist or may have been deleted.
      </p>
      {onBackToList && (
        <Button variant="outline" onClick={onBackToList}>
          Back to Contract List
        </Button>
      )}
    </CardContent>
  </Card>
);
