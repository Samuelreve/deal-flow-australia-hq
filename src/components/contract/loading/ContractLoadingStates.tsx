
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText } from "lucide-react";

export const ContractListSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export const ContractUploadProgress: React.FC<{ progress: number; fileName?: string }> = ({
  progress,
  fileName
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <h3 className="font-medium">Uploading Contract</h3>
          {fileName && (
            <p className="text-sm text-muted-foreground">{fileName}</p>
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

export const ContractAnalysisLoading: React.FC = () => (
  <Card>
    <CardContent className="p-8">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <FileText className="h-12 w-12 text-muted-foreground/30" />
          <Loader2 className="h-6 w-6 animate-spin text-primary absolute top-3 left-3" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Analyzing Contract</h3>
          <p className="text-muted-foreground max-w-md">
            Our AI is reviewing the document to provide insights and summaries. This may take a few moments.
          </p>
        </div>
        <div className="w-full max-w-md">
          <Progress value={65} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">Processing document content...</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
