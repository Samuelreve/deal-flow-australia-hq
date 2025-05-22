
import React from 'react';
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InsightsRecommendationsProps {
  recommendations: string[];
  onApplyRecommendation?: (recommendation: string) => void;
}

const InsightsRecommendations = ({ 
  recommendations = [], 
  onApplyRecommendation 
}: InsightsRecommendationsProps) => {
  // Ensure we have an array even if null/undefined is passed
  const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];
  
  if (safeRecommendations.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg">Recommendations</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {safeRecommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-amber-500 mt-0.5">•</span>
              <div className="flex-1">
                <p className="text-sm">{rec}</p>
                {onApplyRecommendation && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => onApplyRecommendation(rec)}
                  >
                    Apply Recommendation
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default InsightsRecommendations;
