
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target, Loader2, AlertTriangle } from "lucide-react";
import { DealSummary } from "@/types/deal";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIPrediction {
  id: string;
  dealId: string;
  dealTitle: string;
  currentScore: number;
  predictedScore30Days: number;
  predictedScore60Days?: number;
  predictedScore90Days?: number;
  trajectory: 'improving' | 'stable' | 'declining';
  confidence: 'high' | 'medium' | 'low';
  keyDrivers: string[];
  riskFactors: string[];
  recommendation: string;
  metrics: {
    totalMilestones: number;
    completedMilestones: number;
    overdueMilestones: number;
    blockedMilestones: number;
    daysSinceActivity?: number;
  };
  disclaimer: string;
}

interface HealthPredictionEngineProps {
  deals: DealSummary[];
  userId?: string;
}

const HealthPredictionEngine: React.FC<HealthPredictionEngineProps> = ({ deals, userId }) => {
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<string>('');

  const generatePrediction = async (dealId: string) => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }
    
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    setLoading(true);
    try {
      // Call the real AI prediction edge function
      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'predict_deal_health',
          dealId,
          userId
        }
      });

      if (error) throw error;

      const prediction = data.prediction;
      const metrics = data.metrics;

      const newPrediction: AIPrediction = {
        id: `pred-${Date.now()}`,
        dealId,
        dealTitle: deal.title,
        currentScore: prediction.currentScore,
        predictedScore30Days: prediction.predictedScore30Days,
        predictedScore60Days: prediction.predictedScore60Days,
        predictedScore90Days: prediction.predictedScore90Days,
        trajectory: prediction.trajectory || 'stable',
        confidence: prediction.confidence || 'medium',
        keyDrivers: prediction.keyDrivers || [],
        riskFactors: prediction.riskFactors || [],
        recommendation: prediction.recommendation || 'No specific recommendations at this time.',
        metrics: {
          totalMilestones: metrics.totalMilestones,
          completedMilestones: metrics.completedMilestones,
          overdueMilestones: metrics.overdueMilestones,
          blockedMilestones: metrics.blockedMilestones,
          daysSinceActivity: metrics.daysSinceActivity
        },
        disclaimer: data.disclaimer
      };

      // Save to database
      await supabase
        .from('deal_health_predictions')
        .insert({
          deal_id: dealId,
          user_id: userId,
          probability_percentage: prediction.predictedScore30Days,
          confidence_level: prediction.confidence,
          reasoning: prediction.recommendation,
          suggested_improvements: prediction.keyDrivers.map((driver: string) => ({
            area: 'Key Driver',
            recommendation: driver,
            impact: 'medium'
          }))
        });

      setPredictions(prev => [newPrediction, ...prev]);
      toast.success('AI prediction generated successfully');
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast.error('Failed to generate AI prediction');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getTrajectoryIcon = (trajectory: string) => {
    switch (trajectory) {
      case 'improving': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'declining': return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <CheckCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getTrajectoryBadge = (trajectory: string) => {
    switch (trajectory) {
      case 'improving': return <Badge className="bg-green-100 text-green-800">Improving</Badge>;
      case 'declining': return <Badge className="bg-red-100 text-red-800">Declining</Badge>;
      default: return <Badge className="bg-yellow-100 text-yellow-800">Stable</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Health Predictions
        </CardTitle>
        <CardDescription>
          Generate AI-powered health score predictions using real deal data and milestone analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Deal Selection */}
        <div className="flex gap-2">
          <select
            value={selectedDeal}
            onChange={(e) => setSelectedDeal(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md bg-background"
          >
            <option value="">Select a deal...</option>
            {deals.map(deal => (
              <option key={deal.id} value={deal.id}>
                {deal.title} (Current: {deal.healthScore}%)
              </option>
            ))}
          </select>
          
          <Button
            onClick={() => selectedDeal && generatePrediction(selectedDeal)}
            disabled={!selectedDeal || loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                Predict
              </>
            )}
          </Button>
        </div>

        {/* Predictions List */}
        <div className="space-y-4">
          {predictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No predictions generated yet</p>
              <p className="text-sm">Select a deal and click "Predict" to get AI-powered health analysis</p>
            </div>
          ) : (
            predictions.map((prediction) => (
              <Card key={prediction.id} className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getTrajectoryIcon(prediction.trajectory)}
                      <div>
                        <h4 className="font-semibold">{prediction.dealTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          AI Prediction • {getTrajectoryBadge(prediction.trajectory)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {prediction.predictedScore30Days}%
                      </div>
                      <div className={`text-sm ${getConfidenceColor(prediction.confidence)}`}>
                        {prediction.confidence} confidence
                      </div>
                    </div>
                  </div>

                  {/* Score Comparison */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="text-lg font-bold">{prediction.currentScore}%</p>
                    </div>
                    <div className="text-center p-2 bg-primary/10 rounded">
                      <p className="text-xs text-muted-foreground">30 Days</p>
                      <p className="text-lg font-bold text-primary">{prediction.predictedScore30Days}%</p>
                    </div>
                    {prediction.predictedScore60Days && (
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">60 Days</p>
                        <p className="text-lg font-bold">{prediction.predictedScore60Days}%</p>
                      </div>
                    )}
                  </div>

                  <Progress 
                    value={prediction.predictedScore30Days} 
                    className="mb-4"
                  />

                  {/* Metrics Summary */}
                  <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
                    <div className="text-center p-2 border rounded">
                      <p className="font-medium">{prediction.metrics.totalMilestones}</p>
                      <p className="text-muted-foreground">Total</p>
                    </div>
                    <div className="text-center p-2 border rounded">
                      <p className="font-medium text-green-600">{prediction.metrics.completedMilestones}</p>
                      <p className="text-muted-foreground">Done</p>
                    </div>
                    <div className="text-center p-2 border rounded">
                      <p className="font-medium text-yellow-600">{prediction.metrics.overdueMilestones}</p>
                      <p className="text-muted-foreground">Overdue</p>
                    </div>
                    <div className="text-center p-2 border rounded">
                      <p className="font-medium text-red-600">{prediction.metrics.blockedMilestones}</p>
                      <p className="text-muted-foreground">Blocked</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Key Drivers */}
                  {prediction.keyDrivers.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Key Drivers
                      </h5>
                      <ul className="space-y-1">
                        {prediction.keyDrivers.map((driver, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {driver}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {prediction.riskFactors.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Risk Factors
                      </h5>
                      <ul className="space-y-1">
                        {prediction.riskFactors.map((risk, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Separator className="my-4" />

                  {/* Recommendation */}
                  <div className="bg-muted p-3 rounded-lg">
                    <h5 className="font-medium mb-1">AI Recommendation</h5>
                    <p className="text-sm text-muted-foreground">{prediction.recommendation}</p>
                  </div>

                  {/* Disclaimer */}
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    {prediction.disclaimer}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthPredictionEngine;
