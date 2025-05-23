
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp } from "lucide-react";
import { HealthPrediction } from '@/types/advancedHealthMonitoring';

interface HealthPredictionPanelProps {
  predictions: HealthPrediction[];
  dealId?: string;
}

const HealthPredictionPanel: React.FC<HealthPredictionPanelProps> = ({ predictions, dealId }) => {
  const filteredPredictions = dealId 
    ? predictions.filter(p => p.deal_id === dealId)
    : predictions;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Health Predictions
        </CardTitle>
        <CardDescription>
          AI-powered predictions for deal health scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredPredictions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No predictions available</p>
            <p className="text-sm">Create predictions using the AI Predictions tab</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPredictions.map((prediction) => (
              <div key={prediction.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">
                    {prediction.confidence_level} confidence
                  </Badge>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-semibold">{prediction.probability_percentage}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{prediction.reasoning}</p>
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(prediction.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthPredictionPanel;
