
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Upload, FileX, Wifi, HelpCircle } from "lucide-react";

interface EnhancedErrorProps {
  error: string;
  errorCode?: string;
  onRetry?: () => void;
  onReset?: () => void;
  suggestions?: string[];
}

export const ContractUploadErrorEnhanced: React.FC<EnhancedErrorProps> = ({
  error,
  errorCode,
  onRetry,
  onReset,
  suggestions = []
}) => (
  <Alert variant="destructive" className="animate-fade-in">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle className="flex items-center gap-2">
      Upload Failed
      {errorCode && (
        <span className="text-xs font-mono bg-destructive/20 px-2 py-1 rounded">
          {errorCode}
        </span>
      )}
    </AlertTitle>
    <AlertDescription className="mt-3 space-y-4">
      <p>{error}</p>
      
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="font-medium text-sm">Try these solutions:</p>
          <ul className="text-sm space-y-1 ml-4">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="list-disc">{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 pt-2">
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
        <Button variant="ghost" size="sm" asChild>
          <a href="/help/contract-upload" className="flex items-center">
            <HelpCircle className="h-3 w-3 mr-1" />
            Get Help
          </a>
        </Button>
      </div>
    </AlertDescription>
  </Alert>
);

export const NetworkErrorState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <Card className="animate-fade-in border-destructive">
    <CardContent className="p-6 text-center">
      <Wifi className="h-12 w-12 mx-auto text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Connection Problem</h3>
      <p className="text-muted-foreground mb-4">
        Unable to connect to our servers. Please check your internet connection and try again.
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Connection
        </Button>
      )}
    </CardContent>
  </Card>
);

export const ContractAnalysisErrorEnhanced: React.FC<EnhancedErrorProps> = ({
  error,
  onRetry,
  suggestions = [
    "Make sure the document is not password-protected",
    "Try uploading a different file format (PDF, DOCX, TXT)",
    "Check that the file size is under 10MB"
  ]
}) => (
  <Card className="animate-fade-in border-destructive">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-destructive">
        <FileX className="h-5 w-5" />
        Analysis Failed
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-muted-foreground">{error}</p>
      
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Troubleshooting Tips
        </h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {onRetry && (
        <Button onClick={onRetry} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Analysis
        </Button>
      )}
    </CardContent>
  </Card>
);
