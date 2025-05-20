
import React from 'react';
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const TwoFactorLoading: React.FC = () => {
  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoFactorLoading;
