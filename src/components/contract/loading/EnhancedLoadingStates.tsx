
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText, Brain, Upload } from "lucide-react";

export const ContractUploadingState: React.FC<{ 
  fileName?: string; 
  progress?: number;
}> = ({ fileName, progress = 0 }) => (
  <Card className="animate-fade-in">
    <CardContent className="p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Upload className="h-12 w-12 text-muted-foreground/30" />
          <Loader2 className="h-6 w-6 animate-spin text-primary absolute top-3 left-3" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-medium">Uploading Contract</h3>
          {fileName && (
            <p className="text-sm text-muted-foreground truncate max-w-xs">
              {fileName}
            </p>
          )}
        </div>
        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {Math.round(progress)}% complete
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ContractProcessingState: React.FC<{
  stage?: string;
  progress?: number;
}> = ({ stage = "Processing contract...", progress = 45 }) => (
  <Card className="animate-fade-in">
    <CardContent className="p-8">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <FileText className="h-16 w-16 text-muted-foreground/20" />
          <Brain className="h-8 w-8 animate-pulse text-primary absolute top-4 left-4" />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-medium">{stage}</h3>
          <p className="text-muted-foreground max-w-md">
            Our AI is analyzing the document to extract key insights and provide comprehensive analysis.
          </p>
        </div>
        <div className="w-full max-w-md space-y-2">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Analyzing content...</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ContractListSkeletonEnhanced: React.FC = () => (
  <Card className="animate-fade-in">
    <CardHeader>
      <Skeleton className="h-6 w-40" />
    </CardHeader>
    <CardContent className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </CardContent>
  </Card>
);

export const MinimalLoadingSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};
