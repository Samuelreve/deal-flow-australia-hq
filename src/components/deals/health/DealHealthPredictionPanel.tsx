
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentAI } from "@/hooks/document-ai";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DealHealthPredictionResponse } from "@/hooks/document-ai/types";
import { toast } from "sonner";

interface DealHealthPredictionPanelProps {
  dealId: string;
}

const DealHealthPredictionPanel: React.FC<DealHealthPredictionPanelProps> = ({ dealId }) => {
  const [prediction, setPrediction] = useState<DealHealthPredictionResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { predictDealHealth } = useDocumentAI({ dealId });
  
  const handleGetPrediction = async () => {
    if (!dealId) return;
    
    setIsPredicting(true);
    setError(null);
    
    try {
      // Pass the dealId to the predictDealHealth function
      const result = await predictDealHealth(dealId);
      
      if (result) {
        setPrediction(result);
      } else {
        setError("Failed to generate deal health prediction");
        toast.error("Couldn't generate prediction", {
          description: "Please try again later"
        });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      toast.error("Error generating prediction", {
        description: err.message || "Please try again later"
      });
    } finally {
      setIsPredicting(false);
    }
  };
  
  // Helper function to determine color based on probability
  const getProbabilityColor = (percentage: number): string => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };
  
  // Helper function to determine badge variant based on impact
  const getImpactVariant = (impact: string): "default" | "outline" | "secondary" | "destructive" => {
    switch (impact.toLowerCase()) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          Deal Health Prediction
        </CardTitle>
        <CardDescription>
          AI-powered analysis of deal success probability
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!prediction && !isPredicting && !error && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <TrendingUp size={32} className="mb-2 text-primary/60" />
            <p className="text-muted-foreground max-w-xs">
              Get AI-generated predictions about this deal's likelihood of success and recommendations for improvement.
            </p>
            <Button 
              onClick={handleGetPrediction} 
              className="mt-4"
            >
              Generate Prediction
            </Button>
          </div>
        )}
        
        {isPredicting && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary/60 mb-2" />
            <p className="text-muted-foreground">Analyzing deal data...</p>
          </div>
        )}
        
        {error && !isPredicting && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <TrendingDown size={32} className="mb-2 text-destructive/60" />
            <p className="text-muted-foreground">{error}</p>
            <Button
              onClick={handleGetPrediction}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}
        
        {prediction && !isPredicting && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Success Probability
                </div>
                <div className={`text-2xl font-bold ${getProbabilityColor(prediction.probability_of_success_percentage)}`}>
                  {prediction.probability_of_success_percentage}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Confidence: {prediction.confidence_level}
                </div>
              </div>
              
              <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center relative"
                style={{ 
                  borderColor: `var(--${prediction.probability_of_success_percentage >= 75 ? 'success' : (prediction.probability_of_success_percentage >= 50 ? 'warning' : 'destructive')})`,
                  opacity: 0.8
                }}
              >
                <span className="text-lg font-bold">{prediction.probability_of_success_percentage}%</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium">Reasoning</div>
              <p className="text-sm text-muted-foreground mt-1">
                {prediction.prediction_reasoning}
              </p>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2">Suggested Improvements</div>
              <ul className="space-y-2">
                {prediction.suggested_improvements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm border-l-2 border-primary/20 pl-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{improvement.area}</span>
                        <Badge variant={getImpactVariant(improvement.impact)} className="text-[10px]">
                          {improvement.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-0.5">
                        {improvement.recommendation}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      
      {prediction && (
        <CardFooter className="text-xs text-muted-foreground border-t pt-4">
          <p>
            {prediction.disclaimer}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default DealHealthPredictionPanel;
