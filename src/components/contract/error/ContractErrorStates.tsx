
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, FileX } from "lucide-react";

interface ContractErrorProps {
  error: string;
  onRetry?: () => void;
}

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
