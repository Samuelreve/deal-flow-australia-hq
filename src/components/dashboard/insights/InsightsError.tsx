
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface InsightsErrorProps {
  error: Error | string | null;
}

const InsightsError = ({ error }: InsightsErrorProps) => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error generating insights</AlertTitle>
      <AlertDescription>{error?.toString()}</AlertDescription>
    </Alert>
  );
};

export default InsightsError;
