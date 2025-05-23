
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { HealthPrediction } from "@/types/advancedHealthMonitoring";
import { format } from 'date-fns';

interface HealthPredictionPanelProps {
  predictions: HealthPrediction[];
  dealId?: string;
}

const HealthPredictionPanel: React.FC<HealthPredictionPanelProps> = ({ predictions, dealId }) => {
  const filteredPredictions = dealId 
    ? predictions.filter(p => p.deal_id === dealId)
    : predictions;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPredictionTrend = (prediction: HealthPrediction, currentScore: number) => {
    if (prediction.predicted_score > currentScore) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (prediction.predicted_score < currentScore) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Health Predictions
        </CardTitle>
        <CardDescription>
          AI-powered predictions for future health scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredPredictions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No predictions available yet
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPredictions.slice(0, 5).map((prediction) => (
              <div key={prediction.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPredictionTrend(prediction, 75)} {/* Mock current score */}
                    <span className="font-medium">
                      Predicted Score: {prediction.predicted_score}%
                    </span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getConfidenceColor(prediction.confidence_level)}
                  >
                    {Math.round(prediction.confidence_level * 100)}% confidence
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <Progress value={prediction.predicted_score} className="h-2" />
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  Prediction for: {format(new Date(prediction.prediction_date), 'MMM dd, yyyy')}
                </div>
                
                {prediction.factors.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Key Factors:</div>
                    {prediction.factors.slice(0, 3).map((factor, index) => (
                      <div key={index} className="text-xs bg-muted p-2 rounded">
                        <span className="font-medium">{factor.factor}:</span> {factor.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthPredictionPanel;
