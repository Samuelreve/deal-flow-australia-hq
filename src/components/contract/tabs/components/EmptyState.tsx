
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";

const EmptyState: React.FC = () => {
  return (
    <Card className="mb-4">
      <CardContent className="p-6 text-center">
        <Brain className="h-10 w-10 mx-auto text-primary/70 mb-3" />
        <h3 className="text-lg font-medium mb-2">Ask about this contract</h3>
        <p className="text-muted-foreground mb-4">
          Ask questions or select an analysis type to get insights.
        </p>
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
          <p className="font-medium">Example questions:</p>
          <ul className="mt-1 space-y-1">
            <li>• What are the key terms?</li>
            <li>• What are my obligations?</li>
            <li>• Is there a termination clause?</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
