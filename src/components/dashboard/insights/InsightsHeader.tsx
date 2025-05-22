
import React from 'react';
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InsightsHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

const InsightsHeader = ({ onRefresh, loading }: InsightsHeaderProps) => {
  return (
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">AI Deal Insights</CardTitle>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "Generating..." : "Refresh Insights"}
        </Button>
      </div>
      <CardDescription>
        AI-powered analysis of your deal portfolio
      </CardDescription>
    </CardHeader>
  );
};

export default InsightsHeader;
