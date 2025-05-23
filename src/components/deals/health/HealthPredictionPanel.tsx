
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HealthPrediction } from "@/types/advancedHealthMonitoring";
import { format } from 'date-fns';

interface HealthPredictionPanelProps {
  predictions: HealthPrediction[];
  dealId?: string;
  onRefresh?: () => void;
  loading?: boolean;
}

const HealthPredictionPanel: React.FC<HealthPredictionPanelProps> = ({ 
  predictions, 
  dealId, 
  onRefresh,
  loading = false 
}) => {
  const filteredPredictions = dealId 
    ? predictions.filter(p => p.deal_id === dealId)
    : predictions;

  const getConfidenceColor = (confidence: string) => {
    const confidenceMap: Record<string, string> = {
      'high': 'text-green-600',
      'medium': 'text-yellow-600',
      'low': 'text-red-600'
    };
    return confidenceMap[confidence.toLowerCase()] || 'text-gray-600';
  };

  const getPredictionTrend = (prediction: HealthPrediction, currentScore: number) => {
    if (prediction.probability_percentage > currentScore) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (prediction.probability_percentage < currentScore) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-gray-500" />;
  };

  const getImpactVariant = (impact: string): "default" | "outline" | "secondary" | "destructive" => {
    switch (impact.toLowerCase()) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Health Predictions
            </CardTitle>
            <CardDescription>
              AI-powered predictions for future health scores
            </CardDescription>
          </div>
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading predictions...
          </div>
        ) : filteredPredictions.length === 0 ? (
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
                      Success Probability: {prediction.probability_percentage}%
                    </span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getConfidenceColor(prediction.confidence_level)}
                  >
                    {prediction.confidence_level} confidence
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <Progress value={prediction.probability_percentage} className="h-2" />
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  Generated: {format(new Date(prediction.created_at), 'MMM dd, yyyy')}
                </div>

                {prediction.reasoning && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Reasoning:</div>
                    <div className="text-sm bg-muted p-2 rounded">
                      {prediction.reasoning}
                    </div>
                  </div>
                )}
                
                {prediction.suggested_improvements.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Suggested Improvements:</div>
                    {prediction.suggested_improvements.slice(0, 3).map((improvement, index) => (
                      <div key={index} className="text-xs bg-muted p-2 rounded">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{improvement.area}:</span>
                          <Badge variant={getImpactVariant(improvement.impact)} className="text-[10px]">
                            {improvement.impact} impact
                          </Badge>
                        </div>
                        <p className="mt-1">{improvement.recommendation}</p>
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
