
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText } from "lucide-react";

export const ContractAnalysisLoading: React.FC = () => (
  <div className="text-center py-8">
    <div className="relative">
      <FileText className="h-12 w-12 mx-auto text-muted-foreground/30" />
      <Loader2 className="h-6 w-6 animate-spin text-primary absolute top-3 left-1/2 -translate-x-1/2" />
    </div>
    <div className="space-y-2 mt-4">
      <h3 className="text-lg font-medium">Analyzing Contract</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Our AI is reviewing the document to provide insights. This may take a moment.
      </p>
    </div>
    <div className="w-full max-w-md mx-auto mt-4">
      <Progress value={65} className="h-2" />
      <p className="text-sm text-muted-foreground mt-2">Processing document content...</p>
    </div>
  </div>
);

export const MinimalLoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg", text?: string }> = ({ 
  size = "md",
  text = "Loading..."
}) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  return (
    <div className="flex items-center gap-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin`} />
      <span>{text}</span>
    </div>
  );
};
